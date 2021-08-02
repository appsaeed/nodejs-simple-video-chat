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
        if(confirm("Admin Receved Your Call \nAre You Ready to Continue?") == false)return false;
        const videos = document.createElement('video')
        videos.setAttribute('id','receved-video')
        call.answer(stream)         
        call.on('stream', (stream)=>{
            addVideoStream(videos,stream)
        })  
    })

    socket.on('user-connected', userId =>{
        connecteToNewUser(userId, stream) 
        console.log('connectedToNewUser: '+userId)       
    })
});

socket.on('user-disconnected', userId=>{
    if(peers[userId]) peers[userId].close()
    
})

myPeer.on('open',id=>{
    socket.emit('join-room',ROOM_ID, id)
});

function connecteToNewUser(userId, stream){
    if(confirm('Someone is Calling You\nAre you ready to Receved the call from: \n'+userId) == false) return false;
    const call = myPeer.call(userId,stream)
    const video = document.createElement('video')
    video.setAttribute('id','receved-video')

    call.on('stream', function(stream) {
        // `stream` is the MediaStream of the remote peer.
        // Here you'd add it to an HTML video/canvas element.
        addVideoStream(video,stream)
        console.log('Answerd from:'+userId);
        
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