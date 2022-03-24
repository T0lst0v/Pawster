﻿const {createModule, gql} = require('graphql-modules');
const {hashPassword, comparePasswordHashes} = require("../../utils/password_utils");
const {updateUser, createUser, deleteUser, findUserByEmail, findUserById, doesUserEmailExist} = require("../../mongodb/operations/user_operations");
const {authenticate, createToken} = require("../../utils/auth_utils");
const {jwtError} = require("../api_responses/auth/auth_error");
const {invalidUsernamePasswordError, invalidPasswordError, userAlreadyExistsError, userIdNotFoundError, userEmailNotFoundError} = require("../api_responses/user/user_error");
const {createUserSuccess, passwordUpdatedSuccess, emailUpdatedSuccess, accountDeletedSuccess, userEmailFoundSuccess, userIdFoundSuccess} = require("../api_responses/user/user_success");
const {deleteAddress} = require("../../mongodb/operations/address_operations");
const {loginSuccess} = require("../api_responses/auth/auth_success");
const {deletePets} = require("../../mongodb/operations/pet_operations");
const {deleteAllUserPhotos} = require("../../mongodb/operations/user_photo_operations");

module.exports.userModule = createModule({
    id: 'user_module',
    dirname: __dirname,
    typeDefs: [
        gql`
            type Query {
                getUserByEmail(email: String!): UserResponse
                getUserById(userId: ID!): UserResponse
                validateUserLogin(email: String!, password: String!) : UserLoginResponse
            }

            type Mutation {
                createUser(user: UserInput!) : UserLoginResponse
                updateUserPassword(userId: ID!, password: String!, newPassword: String!) : UserResponse
                updateUserEmail(userId: ID!, email: String!, newEmail: String!) : UserResponse
                deleteUser(userId: ID!) : UserResponse
            }
            
            type User {
                id: ID
                email: String
                password: String
                firstName: String
                lastName: String
                dateCreated: Date
            }

            input UserInput {
                id: ID
                email: String
                password: String
                firstName: String
                lastName: String
                dateCreated: Date
            }

            type UserLoginResponse {
                success: Boolean
                message: String
                user: User
                token: String
            }
            
            type UserResponse {
                success: Boolean
                message: String
                user: User
            }
        `
    ],
    resolvers: {
        Query: {
            getUserByEmail: async (parent, {email}, context) => {
                const authenticated = await authenticate(context);
                if (!authenticated) return jwtError();

                const user = await findUserByEmail(email);
                if (!user) return userEmailNotFoundError(email);

                return userEmailFoundSuccess(user);
            },
            getUserById: async (parent, {userId}, context) => {
                const authenticated = await authenticate(context);
                if (!authenticated) return jwtError();

                const user = await findUserById(userId);
                if (!user) return userIdNotFoundError(userId);

                return userIdFoundSuccess(user);
            },
            validateUserLogin: async (parent, {email, password}) => {
                const user = await findUserByEmail(email);
                if (!user) return userEmailNotFoundError(email);

                const validPassword = await comparePasswordHashes(password, user.password);
                if (!validPassword) return invalidUsernamePasswordError();

                const token = await createToken(email);

                return loginSuccess(user, token);
            }
        },
        Mutation: {
            createUser: async (parent, {user}) => {
                const userAlreadyExists = await doesUserEmailExist(user.email);
                if (userAlreadyExists) return userAlreadyExistsError(user.email);

                user.password = await hashPassword(user.password);

                const newUser = await createUser(user);
                const token = await createToken(user.email);

                return createUserSuccess(newUser, token);
            },
            updateUserPassword: async(parent, {userId, password, newPassword}, context) => {
                const authenticated = await authenticate(context);
                if (!authenticated) return jwtError();

                const user = await findUserById(userId);
                if (!user) return userIdNotFoundError(userId);

                const validPassword = await comparePasswordHashes(password, user.password);
                if (!validPassword) return invalidPasswordError(userId);

                user.password = await hashPassword(newPassword);
                await updateUser(user);

                return passwordUpdatedSuccess(user);
            },
            updateUserEmail: async (parent, {userId, email, newEmail}, context) => {
                const authenticated = await authenticate(context);
                if (!authenticated) return jwtError();

                const user = await findUserById(userId);
                if (!user) return userIdNotFoundError(userId);

                const existingUser = await doesUserEmailExist(newEmail);
                if (existingUser) return userAlreadyExistsError(newEmail);

                user.email = newEmail;
                await updateUser(user);

                return emailUpdatedSuccess(user, email, newEmail);
            },
            deleteUser: async (parent, {userId}, context) => {
                const authenticated = await authenticate(context);
                if (!authenticated) return jwtError();

                const user = await findUserById(userId);
                if (!user) return userIdNotFoundError(userId);

                // Todo: add more deletes as database table get built
                await deleteUser(userId);
                await deleteAddress(userId);
                await deletePets(userId);
                await deleteAllUserPhotos(userId);

                return accountDeletedSuccess(user);
            }
        }
    }
});