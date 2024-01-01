## About 
This project is based on server side rendered `node` application that serves multiple versions of a voice-to-voice functionality and acts as a server that responds to the clients through an audio format. The responses is generated using openAI chat completion using response streaming. The following shows the breakdown of the directory structure for the repository

    .
    ├── files                # (Not for official use) collection of server rendered file formats
    ├── public               # Server rendered page is served through this directory
        ├── default 
            ├── index.html
        ├── other
            ├── index.html
        ├── sockets          # Used to store the user voice files
            ├── index.html
        ├── uploads          # Used to store the user voice files
    ├── index.js             # (For testing purpose only) scripts to test third party libraries
    ├── package.json         
    ├── server.js            # 1st variation of server using file written audio responds 
    ├── sockets-server.js    # 2nd variation of the server uses sockets for audio communication
    └── README.md

## Getting Started
