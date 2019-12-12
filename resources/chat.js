window.onload = function() {
    // let divMain = document.getElementById('mainDiv');
    let divMessage = document.getElementById('messageDiv');
    let divChatInfo = document.getElementById(('chatInfo'));
    let divMessageInput = document.getElementById(('messageInputDiv'));

    let joinBtn = document.getElementById('btnRoom');
    let messageBtn = document.getElementById('btnMessage');
    divMessageInput.className = "pTagGone";
    
    let chatRoom = "";
    let userName = "";
    let userMessage = "";
    let joinRoom = "";

    let wsurl = "ws://" + location.host;
    let ws = new WebSocket(wsurl);

    ws.onopen = function() {
        joinBtn.onclick = function() {
            chatRoom = document.getElementById('roomName').value;
            joinRoom = "join " + chatRoom;
            userName = document.getElementById('nameInput').value;
            divChatInfo.className = 'pTagGone'

            console.log("[open] Connection established");
            console.log("Sending to server");
            ws.send(joinRoom);

            divMessageInput.classList.remove("pTagGone");
            document.getElementById('messageInput').focus();

            console.log("chatROom: " + chatRoom);

            let titleH = document.getElementById("chatRoomSpan");
            titleH.innerHTML = "ChatRoom: " + chatRoom;
        }

        messageBtn.onclick = function () {
            userMessage = document.getElementById('messageInput').value;
            let message = userName + " " + userMessage;
            document.getElementById('messageInput').focus();
            
            ws.send(message);
        }
    }

    ws.onmessage = function(e) {
        let resData = JSON.parse(e.data);
        let dOuter = document.createElement('div');
        let dInner = document.createElement('div');
        let h = document.createElement('span');
        let sptime = document.createElement('span');
        let p = document.createElement('p');

        if (resData.user === userName) {
            dInner.className = "uk-card uk-card-default uk-card-body";
        } else {
            dInner.className = "uk-card uk-card-primary uk-card-body";
        }

        dOuter.className = "uk-first-column";

        h.className = "uk-card-title uk-text-medium uk-text-break";
        h.innerHTML = resData.message;
        dInner.appendChild(h);

        let d = new Date();
        let t = d.toLocaleTimeString();
        sptime.className = "uk-text-muted uk-text-small";
        sptime.innerHTML = "        " + t;
        dInner.append(sptime);

        p.innerHTML = resData.user;
        dInner.appendChild(p);

        dOuter.appendChild(dInner);
        divMessage.prepend( dOuter);
        
        // dInner.scrollIntoView(true);

        // document.getElementById('messagePTag').className = "pTagAppear";
        if (resData.user === userName) {
            document.getElementById('messageInput').focus();
            clearText();
        }
        console.log(resData);        
    }

    ws.close = function() {

    }

    function clearText() {
        document.getElementById('messageInput').value = '';
    }

    // Get the input field
    var input = document.getElementById("messageInput");

    // Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            messageBtn.click();
        }
    });

    // Get the input field
    var input2 = document.getElementById("nameInput");

    // Execute a function when the user releases a key on the keyboard
    input2.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            joinBtn.click();
        }
    });
}
