## About 
This project is based on server side rendered `node` application that serves multiple versions of a voice-to-voice functionality and acts as a server that responds to the clients through an audio format. The responses is generated using openAI chat completion using response streaming. The following shows the breakdown of the directory structure for the repository

    .
    ├── files                              # (Not for official use) collection of server rendered file formats
    ├── public                             # Server rendered page is served through this directory
        ├── templates
            ├── file 
                ├── index.html
            ├── sockets
                ├── index.html
            ├── default          
                ├── index.html
        ├── uploads                         # Used to store the user voice files
    ├── scripts                             
        ├── test                            # (For testing purpose only) scripts to test third party libraries
    ├── package.json         
    ├── servers 
        ├── file-based-response-server.js   # 1st variation of server using file written audio responds 
        ├── sockets-server.js               # 2nd variation of the server uses sockets for audio communication
    └── README.md

## Getting Started 
The `servers` folder comprises of multiple variations of approaches towards a voice-to-voice bot, all these apporaches and their the average time recorded for several conversations have also been recorded to create a comparison. This repository uses OpenAI tools for transcribing, response generation and text to speech synthesis. On the other hand it uses [RecordRTC](https://www.webrtc-experiment.com/) utility library to record audio in a complete file format and audio chunks. The first iteration of the voice to voice communication is depicted within the diagram below

<img src="https://github.com/Conrad-X/openai-voice-to-voice-bot/assets/6302514/9ee0dd90-5caf-4bfd-abbd-3035d8ad75c8" width="800" />

The numbered circles show the four stages of processing required to achieve the results and going through each of the process sequentially can cause alot of latency issues approx (~ 15-20 seconds avg). To adopt parallelism within these four processes, multiple experiments were conducted in terms of approaches which are listed below. Follow the steps below to run the application through these approaches

- Create a .env file comprising of the folling details
  ```
  OPENAI_API_KEY = "XXXXXXXXXXXXXX"
  ```

- Install Dependencies
  ```
  npm install
  ```
  
- Run the following commands
    - To run **File based response server**
        
      ```
      npm run start:file
      ```
        
    - To run **Sockets based response server**
        
      ```
      npm run start:socket
      ```
        
    - To run **Event based response server**
        
      ```
      npm run start:sse
      ```
  - Run the server on `http://localhost:8000`

### File Based Response Server

### Sockets Based Server

### Server-Sent-Events Based Server
TBD
