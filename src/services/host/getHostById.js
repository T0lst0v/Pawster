﻿import {apiRoute} from "../../utils/apiRoute";
import {gql} from "@apollo/client";
import getGqlString from "../../utils/graphql_utils";

export default async function getHostById(userId) {
    let query = gql`query Query($userId: ID!) {
        getHostById(userId: $userId) {
            success
            message
            host {
                aboutMe
                cancellationPolicy
                canHostMultiplePets
                canHostSmallPet,
                canHostMediumPet,
                canHostLargePet,
                canHostGiantPet,
                canHostUnspayedFemales
                daysAvailable
                doesCat
                doesDog
                doesBoarding
                doesHouseSitting
                doesDropInVisits
                doesDayCare
                doesDogWalking
                experience
                hasChildren
                hasOtherPets
                isHomeFullTime
                isSmoking
                range
                schedule
                sizeCanHost
                totalCanHost
                typeOfHome
                typeOfYard
            }
        }
    }`
    query = getGqlString(query);

    const headers = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: localStorage.getItem('token')
        },
        body: JSON.stringify({
            query,
            variables: {
                userId
            }
        })
    };

    const request = await fetch(`${apiRoute}/graphql`, headers);
    return await request.json();
};