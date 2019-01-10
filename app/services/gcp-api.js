const gcpSpeech = require("@google-cloud/speech");

class GcpAPI {
  constructor() {
    this.recognizeStream = null;
    this.gcpClient = new gcpSpeech.SpeechClient();
    this.encoding = "LINEAR16";
    this.sampleRateHertz = 16000;
    this.languageCode = "en-US";

    this.request = {
      config: {
        encoding: this.encoding,
        sampleRateHertz: this.sampleRateHertz,
        languageCode: this.languageCode
      },
      interimResults: true
    };
  }

  startRecognitionStream(io) {
    this.recognizeStream = this.gcpClient
      .streamingRecognize(this.request)
      .on("error", console.error)
      .on("data", data => {
        process.stdout.write(
          data.results[0] && data.results[0].alternatives[0]
            ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
            : `\n\nReached transcription time limit, press Ctrl+C\n`
        );

        io.emit("dataFromGCP", data.results[0].alternatives[0].transcript);

        //Stopping the speech recognition if the user stopped talking
        if (data.results[0] && data.results[0].isFinal) {
          io.emit("endSpeechRecognition", {});
        }
      });
  }

  writingToStream(data) {
    if (this.recognizeStream) {
      this.recognizeStream.write(data);
    }
  }

  stopRecognitionStream() {
    if (this.recognizeStream) {
      this.recognizeStream.end();
    }
    this.recognizeStream = null;
  }
}

module.exports = GcpAPI;
