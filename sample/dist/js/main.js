$(function(){

	/*
	|--------------------------------------------------------------------
	| Chatroom begin here
	|--------------------------------------------------------------------
	*/
	let socketUrl = 'http://localhost:3100';
	let socket = io(socketUrl);
	let location = window.location;
	let connected = false;
	let search = new URLSearchParams(location.search);
	let room = search.get('room');
	let username = search.get('username');
	let inputMessage = $('.inputMessage');
	let typing = false;
	let timeout = undefined;

	if(room && username){
		let link = location.origin + location.pathname + '?room='+ room;
		$('.chatbox, .sharable').show();
		$('.login').hide();
		$('.sharable span').text(link);

		let data = {
			room: room,
			username: username
		}
		// Tell the server your username
      	socket.emit('user login', data);
      	connected = true;
	}else{
		$('.chatbox, .sharable').hide();
		$('.login').show();
		$('#room').val(room);
		connected = false
	}

	//Notify client that someone joined the room.
	socket.on('user login', function(data){
		let message = `<li class="notify">`+ data.username +` joined the group.</li>`;
		addMessage(message);
	});

	// Whenever the server emits 'user left', log it in the chat body
	socket.on('user left', (data) => {
	    let message = `<li class="notify">`+ data.username +` left the group.</li>`;
		addMessage(message);
	    updateTyping(false);
	});

	// Whenever the server emits 'typing', log it in the chat body
	socket.on('typing', (data) => {
		updateTyping(data);
	});

	socket.on('new message', (data) => {
		let message = `<li>
            <div class="avatar">
                <span>
                    <img src="./img/87367.jpg">
                </span>
            </div>
            <div class="message">
                <div class="name">`+ data.username +`</div>
                <p>`+ data.message +`</p>
            </div>
        </li>`;
        addMessage(message);
        updateTyping(false);
	})

	inputMessage.on('keyup', function(){
		let value = $(this).val();
		if(value != ''){
			$('#inputForm button').attr('disabled', false);
		}else{
			$('#inputForm button').attr('disabled', true);
		}
		socket.emit('typing', true);
		clearTimeout(timeout);
		timeout = setTimeout(timeoutFunction, 2000)
	});

	//Submit form
	$('form#inputForm').on('submit', function(event){
		event.preventDefault();
		let message = inputMessage.val();
		socket.emit('new message', message);

		
		let html = `<li class="me">
            <div class="avatar">
                <span>
                    <img src="./img/87367.jpg">
                </span>
            </div>
            <div class="message">
                <div class="name">`+ username +`</div>
                <p>`+ message +`</p>
            </div>
        </li>`;
        //Append message
        addMessage(html);
        //Clear input
        inputMessage.val('');
	});
	/*
	|--------------------------------------------------------------------
	| Onload
	|--------------------------------------------------------------------
	*/
    scrollBottom();


    /*
	|--------------------------------------------------------------------
	| Functions
	|--------------------------------------------------------------------
	*/
	//Append Message
	const addMessage = function(message){
		$('ul#lists').append(message);
	}


	const timeoutFunction = function(){
		typing = false;
		if(connected){
			socket.emit('typing', false);
		}
	}

	//Update Typing
	const updateTyping = function(status){
		if(status){
			$('.typing').show();
		}else{
			$('.typing').hide();
		}
		
	}
    /*
    * Scroll to bottom
    */
    function scrollBottom(){
        var scroll = document.getElementById('conversation');
        scroll.scrollTop = scroll.scrollHeight;
    }
});