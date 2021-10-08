const socket =  io()   // call io to connect to the server

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options           
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// scrolling logic
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  // console.log(newMessageMargin);

  //visible height
  const visibleHeight = $messages.offsetHeight

  //Height of messages container
  const containerHeight = $messages.scrollHeight

  //How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
  // console.log(newMessageStyles)
}

// Add timestamps for location messages
//1. Create generateLocationMessage and export
// - {url: '', createdAt: 0}
//2. Use generatedLocationMessage when server emits locationMessage
//3. Update template to render time before the url
//4. Compile the template with the URL and the formatted time


socket.on("message", (message) =>{
    console.log(message)
  const html = Mustache.render(messageTemplate, {
      username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', (message) => {
  // console.log(url)
  console.log(message)
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  // console.log(room)
  // console.log(users)
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector('#sidebar').innerHTML = html
}) 

$messageForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  
  $messageFormButton.setAttribute('disabled', 'disabled')

  //disable
  const message = e.target.elements.message.value;
  // socket.emit('sendMessage', message)

                            //passing acknowledgement
  socket.emit("sendMessage", message, (error) => {
      $messageFormButton.removeAttribute('disabled')
      $messageFormInput.value = ''
      $messageFormInput.focus()
    //enable

    // console.log('The message was delivered!'+ message)
    if (error) {
      return console.log(error);
    }
    console.log("Message delivered!");
  });
})

    $sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    //disable
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) =>{
        // console.log(position)
        socket.emit("sendLocation", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }, () =>{  //acknowledge
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        });
    })
})

socket.emit('join', { username, room }, (error) => {
  if(error) {
    alert(error)
    location.href = '/'
  }
})
//Goal: Setup acknowledgment
//1. Setup the client acknowledge function
//2. Setup the server to send back the acknowledge
//3. Have the client print "Location shared! when acknowledged"

//Goal: Disable the send location button while location being sent
//1. Set up a selector at the top of the file
//2. Disable the button just before getting the current position
//3. Enable the button in the acknowledgment callback
