import { createYoga} from "graphql-yoga";
import {schema} from "../../../schema/schema";
import cloudinary from "cloudinary";

const {handleRequest} = createYoga({
    schema,
    graphqlEndpoint: '/api/graphql-api',
    fetchAPI:{Response},
});

export {handleRequest as POST, handleRequest as GET, handleRequest as OPTIONS}

// remove image on cloudinary secure key
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})
