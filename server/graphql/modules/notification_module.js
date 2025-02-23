﻿const {PubSub} = require('apollo-server');
const pubsub = new PubSub();
const {createModule, gql} = require("graphql-modules");
const {jwtError} = require("../api_responses/auth/auth_error");
const {authenticate, decodeToken} = require("../../utils/auth_utils");
const {userIdNotFoundError} = require("../api_responses/user/user_error");
const {findUserById} = require("../../mongodb/operations/user_operations");
const {notificationsNotFoundError} = require("../api_responses/notifications/notifications_error");
const {getNotifications, addNotification, deleteNotification} = require("../../mongodb/operations/notification_operations");
const {notificationsFoundSuccess, notificationAddedSuccess, notificationDeletedSuccess} = require("../api_responses/notifications/notifications_success");

module.exports.notificationModule = createModule({
    id: 'notification_module',
    dirname: __dirname,
    typeDefs: [
        gql`
            extend type Query {
                getNotifications : NotificationsResponse
            }

            extend type Mutation {
                addNotification(notification: NotificationInput!) : NotificationResponse
                removeNotification(id: ID!) : NotificationResponse
            }

            extend type Subscription {
                notificationAdded: NotificationAdded
            }

            input NotificationInput {
                fromUserId: ID
                message: String
                link: String
                toUserId: ID
            }

            type Notification {
                fromUserId: ID
                id: ID
                link: String
                message: String
                toUserId: ID
            }

            type NotificationAdded {
                notification: Notification
            }

            type NotificationResponse {
                success: Boolean
                message: String
                notification : Notification
            }

            type NotificationsResponse {
                success: Boolean
                message: String
                notifications : [Notification]
            }
        `
    ],
    resolvers: {
        Query: {
            getNotifications: async (parent, {}, context) => {
                const authenticated = await authenticate(context);
                if (!authenticated) return jwtError();

                const userId = await decodeToken(context);
                if (!userId) return jwtError();

                const user = await findUserById(userId);
                if (!user) return userIdNotFoundError(userId);

                const notifications = await getNotifications(userId);
                if (!notifications || notifications.length === 0) return notificationsNotFoundError(userId);

                return notificationsFoundSuccess(userId, notifications);
            }
        },
        Mutation: {
            addNotification: async (parent, {notification}, context) => {
                const authenticated = await authenticate(context);
                if (!authenticated) return jwtError();

                const userId = await decodeToken(context);
                if (!userId) return jwtError();

                const user = await findUserById(userId);
                if (!user) return userIdNotFoundError(userId);

                const newNotification = await addNotification(notification);

                await pubsub.publish("NOTIFICATION_ADDED", {
                    notificationAdded: {
                        notification: newNotification
                    }});

                return notificationAddedSuccess(newNotification);
            },
            removeNotification: async (parent, {id}, context) => {
                const authenticated = await authenticate(context);
                if (!authenticated) return jwtError();

                const userId = await decodeToken(context);
                if (!userId) return jwtError();

                const user = await findUserById(userId);
                if (!user) return userIdNotFoundError(userId);

                await deleteNotification(id);

                return notificationDeletedSuccess(id);
            }
        },
        Subscription: {
            notificationAdded: {
                subscribe: async () => await pubsub.asyncIterator("NOTIFICATION_ADDED")
            }
        }
    }
});