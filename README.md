A server that will manage events from other applications and add them to a user's stream.

This repository is meant to be run with our [streams-frontend](https://github.com/openworklabs/streams)

In order to properly run this server and the frontend, you need to run two textile nodes. The second textile node can be initted by following the instructions [here](https://docs.textile.io/a-tour-of-textile/#share-a-thread)

Here are the following steps we're currently working on:

1.  frontend client creates a new private, shared webhook thread (where access tokens and metadata about webhooks will be stored)
2.  frontend client creates a new thread (where third party application data will be added)
3.  frontend client adds backend server as a contact
4.  frontend client invites backend server to both threads
5.  backend server is polling invites, upon hearing an invite will accept it
6.  when the frontend client hears the ANNOUNCE event on the webhook thread, it will send a message to the backend instructing the backend to setup one or more webhooks
7.  the backend is subscribed to hear messages on all its threads - when it hears a message, it will initiated a webhook connection with the third party application, and store the access token, the webhook url, and webhook id in the webhook thread
8.  upon hearing of new events from registered webhooks, the backend will place events in the proper thread so the user can load them on a frontend

This repository was initially taken from Fullstack Academy's Boilermaker starter REST server
