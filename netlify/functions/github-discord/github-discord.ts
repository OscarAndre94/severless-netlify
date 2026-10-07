import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

interface NotificationResult {
    message: string;
    imageUrl?: string;
}

const IMAGES = {
    starCreated:   'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDFnYWowdTg5aXIzeGE0Y3Zudm5sN2lmNm13OWtyazI4cnJoNGU3MSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GKJRBmOYg9Ek6H9bM2/giphy.gif',
    starDeleted:   'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDFnYWowdTg5aXIzeGE0Y3Zudm5sN2lmNm13OWtyazI4cnJoNGU3MSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/OjYpgQqrffTWwhCL5R/giphy.gif',
    issueOpened:   'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NTBocWZxNnZibWY1MGJmNHRoMXQ3enNxNHJ5b2NvZW9kcTE2b2llYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8H4BFnRFNlAGY/giphy.gif',
    issueClosed:   'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXY2NWYyNmVkOHVhYjR3bzN2cnhrZG90ZTZzZ2FwaG44eDNqbXk4ayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l3vRlF1vyHm0x510k/giphy.gif',
    issueReopened: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzB1cmQ2cG54dnJkaXZkcm1ud291bWIzeGlrMXJjejBxOW5pdDU0NSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/itrJLgMgsQKJiGUJtq/giphy.gif',
    default:       'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTY3d3lkNm95aHdjNjA3dTV1YTM0aXlsNzNkeGFpcmVqMHplcmR1NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/gU5OZNEQA0J6dJ2XVh/giphy.gif',
};

const notify = async(message: string, imageUrl?: string) => {
   
        const body = {
            content: message,
            embeds: imageUrl
            ? [ { image: { url: imageUrl } } ]
                : [],
        }

        const resp = await fetch( process.env.DISCORD_WEBHOOK_URL ?? '', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(body),
        });

        if ( !resp.ok ) {
            console.log('Error sending message to discord');
            return false;
        }

        return true;
    }

  const onStar = ( payload: any ): NotificationResult => {
       
        const { action, sender, repository } = payload;
        const message = `User ${ sender?.login } ${ action } star on ${ repository?.full_name }`;

        const imageUrl = action === 'created'
            ? IMAGES.starCreated
            : IMAGES.starDeleted;

        return { message, imageUrl };
    }

    const onIssue = ( payload: any ): NotificationResult => {
        
        const { action, issue } = payload;

        if( action === 'opened' ) {
            return {
            message: `An issue was opened with this title ${ issue.title }`, 
            imageUrl: IMAGES.issueOpened,
        };
    }

         if( action === 'closed' ) {
            return {
                message: `An issue was closed by ${ issue?.user?.login }`,
                imageUrl: IMAGES.issueClosed,
            };
        }

         if( action === 'reopened' ) {
            return {
                message: `An issue was reopened by ${ issue?.user?.login }`,
                imageUrl: IMAGES.issueReopened,
            };
        }

       return {
            message: `Unhandled action for the issue event ${ action }`,
            imageUrl: IMAGES.default,
        };
    }


const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {

    const githubEvent = event.headers["x-github-event"] ?? "unknown";
    const payload = JSON.parse( event.body ?? '{}' );
    let message: string;
    let imageUrl: string | undefined;


    console.log(payload);

     switch (githubEvent) {
      case "star": {
        const result = onStar(payload);
        message = result.message;
        imageUrl = result.imageUrl;
        break;
      }

      case "issues": {
        const result = onIssue(payload);
        message = result.message;
        imageUrl = result.imageUrl;
        break;
      }

      default:
        message = `Unknow event ${githubEvent}`;
    }

  
await notify( message, imageUrl );

return {
    statusCode: 200,
    body: JSON.stringify({
        message: 'done'
    }),
    headers: {
        'Content-type':'application/json'
    }
}

};

 export { handler };