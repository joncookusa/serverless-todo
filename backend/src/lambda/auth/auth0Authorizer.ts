import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth');
const auto0Secret = process.env.AUTH_0_SECRET;

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-4ut58bfh.auth0.com/.well-known/jwks.json';

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info(event.authorizationToken);
  logger.info('Authorizing a user : ', event['authorizationToken']);
  try {
    const jwtToken = verifyToken(event['authorizationToken']);
    logger.info('User was authorized', jwtToken);

    return {
      principalId: jwtToken['sub'],
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string) {
  const token = getToken(authHeader);
  logger.info("token");
  logger.info(token);

  const jwt: Jwt = decode(token, { complete: true }) as Jwt;

  logger.info("jwt");
  logger.info(jwt);

  // if (token !== '123') {
  //   throw new Error('Invalid token ' + token);
  // }

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, auto0Secret);
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

// import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
// import 'source-map-support/register'
//
// import { verify, decode } from 'jsonwebtoken'
// import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
// import { JwtPayload } from '../../auth/JwtPayload'
//
// const logger = createLogger('auth')
//
// // TODO: Provide a URL that can be used to download a certificate that can be used
// // to verify JWT token signature.
// // To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'
//
// export const handler = async (
//     event: CustomAuthorizerEvent
// ): Promise<CustomAuthorizerResult> => {
//   logger.info('Authorizing a user', event.authorizationToken)
//   try {
//     verifyToken(event.authorizationToken).then(() => {
//       return {
//         principalId: 'user',
//         policyDocument: {
//           Version: '2012-10-17',
//           Statement: [
//             {
//               Action: 'execute-api:Invoke',
//               Effect: 'Allow',
//               Resource: '*'
//             }
//           ]
//         }
//       }
//     }).catch((e) => {
//       logger.error('User not authorized', { error: e.message });
//       return {
//         principalId: 'User',
//         policyDocument: {
//           Version: '2012-10-17',
//           Statement: [
//             {
//               Action: 'execute-api:Invoke',
//               Effect: 'Deny',
//               Resource: '*'
//             }
//           ]
//         }
//       }
//
//     });
//     // const jwtToken = await verifyToken(event.authorizationToken)
//     // logger.info('User was authorized', jwtToken)
//     //
//     logger.info('Doing this anyway');
//
//   } catch (e) {
//     logger.error('User not authorized', { error: e.message })
//
//     return {
//       principalId: 'user',
//       policyDocument: {
//         Version: '2012-10-17',
//         Statement: [
//           {
//             Action: 'execute-api:Invoke',
//             Effect: 'Deny',
//             Resource: '*'
//           }
//         ]
//       }
//     }
//   }
// };
//
// async function verifyToken(authHeader: string) {
//   const token = getToken(authHeader);
//
//   // const jwt: Jwt = decode(token, { complete: true }) as Jwt
//
//   if (token !== '123') {
//     throw new Error('Invalid token ' + token);
//   }
//   // TODO: Implement token verification
//   // You should implement it similarly to how it was implemented for the exercise for the lesson 5
//   // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
//   //return undefined
// }
//
// function getToken(authHeader: string): string {
//   if (!authHeader) throw new Error('No authentication header')
//
//   if (!authHeader.toLowerCase().startsWith('bearer '))
//     throw new Error('Invalid authentication header')
//
//   const split = authHeader.split(' ')
//   const token = split[1]
//
//   return token
// }

