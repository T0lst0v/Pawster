import {gql} from "@apollo/client";
import {apiRoute} from "../../utils/apiRoute";
import getGqlString from "../../utils/graphql_utils";

export default async function validateUserLogin(email, password) {
    let query = gql`query Query($email: String!, $password: String!) {
        validateUserLogin(email: $email, password: $password) {
            success
            message
            token
            user {
                id
                email
                password
                firstName
                lastName
                dateCreated
            }
        }
    }`
    query = getGqlString(query);

    const headers = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables: {
                password,
                email
            }
        })
    };

    const request = await fetch(`${apiRoute}/graphql`, headers);
    const response = await request.json();

    if (response.data.validateUserLogin.success) {
        localStorage.setItem('jsonwebtoken', response.data.validateUserLogin.token);
        localStorage.setItem('email', response.data.validateUserLogin.user.email);
        localStorage.setItem('userId', response.data.validateUserLogin.user.id);
    }

    return response;
};