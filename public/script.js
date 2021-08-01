const socket = io('/');
const videoGrid = document.getElementById('video-grid');
myPeer = new Peer({
    host:'localhost', 
    port:443,
});

const myVideo = document.createElement('video');
myVideo.muted = true;
myVideo.setAttribute('id','myVideo')
const peers = {}

navigator.mediaDevices.getUserMedia({
    video:{
        width:window.innerWidth,
        height:window.innerHeight
    },
    audio:true,
}).then(stream =>{

    addVideoStream(myVideo, stream);

    myPeer.on('call', call =>{
        const videos = document.createElement('video')
        videos.setAttribute('id','receved-video')
        call.answer(stream)         
        call.on('stream', (stream)=>{
            addVideoStream(videos,stream)
        })
        console.log('call Receved connectionId call.connectionId: ',call.connectionId)    
    })

    socket.on('user-connected', userId =>{
        connecteToNewUser(userId, stream) 
        console.log('connectedToNewUser: '+stream.id)       
    })
});

socket.on('user-disconnected', userId=>{
    if(peers[userId]) peers[userId].close()
    
})

myPeer.on('open',id=>{
    socket.emit('join-room',ROOM_ID, id)
});

function connecteToNewUser(userId, stream){
    const call = myPeer.call(userId,stream)
    const video = document.createElement('video')
    video.setAttribute('id','receved-video')

    call.on('stream', function(stream) {
        // `stream` is the MediaStream of the remote peer.
        // Here you'd add it to an HTML video/canvas element.
        addVideoStream(video,stream)
        console.log('Calling answerd from: '+stream.id)
        
    });

    call.on('error',(error)=>{
        alert('Call Error: '+error);
    })

    call.on('close', () =>{
        video.remove()
    })

    peers[userId] = call
}
// socket.on('user-connected',  (userId) =>{
//     console.log('user connected :' + userId)
// });

function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=>{
         video.play();
    });
    videoGrid.append(video);
}