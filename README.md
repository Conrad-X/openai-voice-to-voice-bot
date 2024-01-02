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
The OpenAI API can create an audio buffer and also store the audio buffer into a file. The idea of this approach was to transfer the user's audio chunks in form data or a file. The transcribing step processes the file and converts it into a text and generates a streamed response through OpenAI. The chunk of stream are gathered in form of a sentence and sent to the `speak` method to be spoken out, the audio generated is saved in an audio file on the server which is played on the client as the audio data continue to stream in. The following diagram depicts the workflow

<img src="https://github.com/Conrad-X/openai-voice-to-voice-bot/assets/6302514/2d3d0acb-51f9-42b2-8ebe-cc96bb9a4742" width="800" /> 

#### Pros
- No audio buffer management on client side or server side.
- The audio plays seemlessly as it's through a file on a server.
- Relatively Faster

#### Cons
- I/O overhead at scale
- The infrastucture would require encrypted file system to ensure security and communication.
- Archiving process would be required to manage the files.

### Sockets Based Server
This approach uses full duplex communication between the client and server through sockets. The recording chunks are collected on the server by 3 seconds interval instead of sending a complete recording file to the server. As the chunks are received, they are transcibed and consolidated on the server and once the last chunk is received, they are immediately sent for response generation, this saves time in transcribing a large sentence. The generated response is streamed just like within the previous section and provided to the speaking utility which generates the audio response buffers which are again sent through the server. The following diagram depicts the workflow

<img src="https://github.com/Conrad-X/openai-voice-to-voice-bot/assets/6302514/a8a53bcb-c531-4269-a939-e495249f9d22" width="800" /> 

#### Pros
- Audio buffer management required on client and server side
- Saves time on transcribing large audio files
- Full duplex communication between server and client, less API calling overhead
- Response not saved on files
- Fast

#### Cons
- Uses sockets, which can cause scaling problems
- audio buffer management on client side can get tricky

### Server-Sent-Events Based Server
TBD

## Experiment Readings
All these formats have been tested over 50 conversations and their times are recorded to get a rough estimation on elapsed time on variable length user queries. The following table shows the readings

| Server Formats      | Average Time (seconds) |
| ------------------- | ---------------------- |
| File based          | TBD                    |
| Sockets based       | 4.4                    |
| Event based         | TBD                    |


## Screenshots
The following shows the screenshot of the server rendered web page in action

<kbd>
    <img width="350" style="border: 1px solid gray" alt="Screenshot 2024-01-02 at 2 10 03 PM" src="https://github.com/Conrad-X/openai-voice-to-voice-bot/assets/6302514/2c30bef7-cd2b-4417-8597-343cacf40e0a">
</kbd>
