let remoteStreams = {};

let handlefail=function(err) {
  console.log(err);
}

function addVideoStream(streamId) {
  console.log("Adding Video")
  let remoteContainer = document.getElementById("remoteStreams");
  let streamDiv = document.createElement("div");
  streamDiv.id = streamId;
  streamDiv.classList.add("remoteStream");
  remoteContainer.appendChild(streamDiv);
}

function addParticipant(name) {
  let participants = document.getElementById("participants");
  let nameSpan = document.createElement("span");
  let divSpan = document.createElement("div");
  divSpan.id = name + "-name";
  nameSpan.classList.add("heading-text");
  nameSpan.innerText = name;
  divSpan.appendChild(nameSpan);
  participants.appendChild(divSpan);
}

function deleteParticipant(name) {
  let participants = document.getElementById("participants");
  let divSpan = document.getElementById(name + "-name");
  participants.removeChild(divSpan);
}

document.getElementById("join").onclick = function () {
  let channelName = document.getElementById("channelName").value;
  let Username = document.getElementById("username").value;
  let appId = "insert-app-id-here";

  let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
  })

  client.init(appId, () => console.log("AgoraRTC Client Connected"), handlefail)

  client.join(null, channelName, Username, () => {
    let localStream = AgoraRTC.createStream({
      video: true,
      audio: true
    })
    localStream.init(function () {
      localStream.play("SelfStream");
      console.log(`App ID: ${appId}\nChannel Name: ${channelName}`)
      client.publish(localStream)
      addParticipant(Username + " (Me)");
    })
  })

  client.on('stream-added', function (evt) {
    console.log("Added Stream");
    client.subscribe(evt.stream, handlefail)
  })

  client.on('stream-subscribed', function (evt) {
    console.log("Subscribed Stream");
    let stream = evt.stream;
    let streamID = stream.getId();
    remoteStreams[streamID] = stream;
    addParticipant(streamID);
    addVideoStream(streamID);
    stream.play(streamID);
  })

  client.on('peer-leave', function (evt) {
    let streamId = evt.stream.getId();
    if (remoteStreams[streamId] != undefined) {
      remoteStreams[streamId].stop()
    }
    deleteParticipant(streamId);
    let remoteContainer = document.getElementById("remoteStreams");
    let streamDiv = document.getElementById(streamId);
    remoteContainer.removeChild(streamDiv);
  })

}