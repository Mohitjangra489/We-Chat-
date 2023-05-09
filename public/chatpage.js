const socket = io();

let usernames;
let userdata;
// let lastmessagespan;
let activeroom;
let maindiv = document.getElementById("users");
let msgtext = document.getElementById("msgtext");
let activeuser = document.getElementById("header").innerText;
// let header1=document.getElementById("header").style.color="red";
let qwerty = document.getElementById('header');
let qwerty2=document.getElementById('s4');
let qwerty3=document.getElementById('lower2');
let qwerty4=document.getElementById('l1');
let qwerty5=document.getElementById('l2');
let messagearea = document.getElementById("lower1");
let div2 = document.getElementById("users");
let homeicon=document.getElementById("s9");
let searchbar=document.getElementById("search");
let dialog=document.getElementById("dialog");
let profileicon=document.getElementById("f8");


let audio=new Audio("pop.mp3");
let audio2=new Audio("ting.mp3");

let flag = false;

homepage();
socket.emit("user", "mohit");

socket.on("userdata", (data) => {
    users(data);      //calling  users function
    userdata = data;
    console.log(data);
});

function users(users) {
    console.log(users);
    maindiv.innerHTML = '';

    users.forEach(element => {

        if (element.name != activeuser) {
            let div = document.createElement("div");
            div.setAttribute("class", "div");
            div.setAttribute("id", `${element._id}`);

            let image = document.createElement("img");
            image.setAttribute("class", "img");
            image.src = "s8.png";

            let nameheading = document.createElement("h1");
            nameheading.setAttribute("class", "nameheading");
            nameheading.innerHTML = element;

            div.appendChild(image);
            div.appendChild(nameheading);
            maindiv.appendChild(div);
        }
    });
    usernames=maindiv.querySelectorAll(".nameheading");
    console.log(usernames);
}


// Eventlistener for add friend functionality..................
let addfriend = document.getElementById("f");

addfriend.addEventListener("click", function () {
    flag = true;
    socket.emit("userdata", activeuser);
   
});


//Eventlistener for typing message in messagebox................

msgtext.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && msgtext.value != '') {
        audio.play();
        sendmessage(e.target.value);
    }
});

function sendmessage(message) {
    let xms  = new Date();
    let msg = {
        sentby: activeuser,
        message: message,
        groupid : sessionStorage.getItem('cgroup'),
        lastmessage:message,
        time : xms.getHours() +  " : " + xms.getMinutes()
    }

    console.log(msg);

    let d=maindiv.querySelectorAll(".nameheading");
    let chatuser=document.getElementById("header").innerText;
    d.forEach(element=>{
        if(element.innerText==chatuser)
        {
             element.nextElementSibling.innerText=message;
        }
    });
    //append message
    appendmessage(msg, 'outgoing');
   
    msgtext.value = '';
    scrolltobottom();

    //send to server
    socket.emit('message', msg);
}

function appendmessage(msg, type) {
    let maindiv = document.createElement("div");
    let classname = type;

    maindiv.classList.add(classname);

    if (classname == "outgoing") {
        let markup = `
 <p style="word-break: break-word;width: 38%;background-color:#2dc100;color: white;font-family: system-ui;overflow:hidden;min-height: 73px;
 padding-left: 10px;border-radius: 20px 0px 20px 0px;-webkit-box-shadow: 6px 6px 1px 0px rgb(0 0 0 / 15%);
 padding-top: 10px;
">${msg.message}</p>
<span style="position: absolute;margin-top: 74px;color: white;margin-right: 10px;">${msg.time}</span>
 `
        maindiv.innerHTML = markup;
        messagearea.appendChild(maindiv);
    }
    else {
        let markup = `
    <span style=" font-family: system-ui;margin-right: -79px;margin-top: -23px;margin-left: 10px;position:absolute">${msg.sentby}</span>
    <p style="word-break: break-word;width: 38%;background-color:black;color: white;font-family: system-ui;overflow: hidden;min-height: 73px;
    padding-left: 10px;    border-radius: 20px 0px 20px 0px;-webkit-box-shadow: 6px 6px 1px 0px rgb(0 0 0 / 15%);
    padding-top: 10px;
   ">${msg.message}</p>
   <span style="position: absolute;margin-top: -37px;color: white;margin-left: 208px;">${msg.time}</span>
   `
        maindiv.innerHTML = markup;
        messagearea.appendChild(maindiv);
    }
    scrolltobottom();
}

//recieve message from server

socket.on('messenger', (msg) => {
    appendmessage(msg, 'incoming');
    scrolltobottom();
})

function scrolltobottom() {
    messagearea.scrollTop = messagearea.scrollHeight;
}

//Eventlistener for adding friends................................. 

div2.addEventListener('click', (event) => {
    if(event.target.id == "users")
    {
       console.log("adsfh");
        return;
    }
    if (flag) {
        if (event.target.value != '') {
            flag=false;
            event.target.style.display = "none";
            let object = {
                user1: activeuser,
                user2: event.target.innerText
            }
            socket.emit("groupdetails", object);

        }
    }
    else
    {   
         if(activeroom!=event.target.id)
        {  
             qwerty.style.display="inline";
             qwerty2.style.display="inline";
             qwerty3.style.display="inline";
             qwerty4.style.display="inline";
             qwerty5.style.display="inline";
             messagearea.innerHTML="";

            socket.emit("givemessages",event.target.id);

           socket.emit('joinroom',event.target.id);

           qwerty.innerText = event.target.children[1].innerText;
           sessionStorage.setItem('cgroup',event.target.id);
           activeroom=event.target.id;
        }

    }
  
});

socket.on('friends', (data) => {
    console.log(data);
    let groups = data[0].groupId;
    console.log(groups);
});

socket.on("groupdetails", (data) => {
    console.log(data);
    friends(data);
    
});

function friends(data) {
    maindiv.innerHTML = '';
    console.log(data);

    data.forEach(element => {
        if (element.name != activeuser) {
            let div = document.createElement("div");
            div.setAttribute("class", "div");
             div.setAttribute("id",`${element.id}`);

            let image = document.createElement("img");
            image.setAttribute("class", "img");
            image.src = "s8.png";

            let nameheading = document.createElement("h1");
            nameheading.setAttribute("class", "nameheading");
            nameheading.innerHTML = element.name;

            let span=document.createElement("span");
            span.setAttribute("class","lastmessage");
           
            if(element.lastmessage)
            {
                if(element.lastmessage.lastmessage)
                {
                span.innerHTML=element.lastmessage.lastmessage;
                }
                else
                {
                    span.innerHTML='';
                }
            }

            div.appendChild(image);
            div.appendChild(nameheading);
            div.appendChild(span);
            maindiv.appendChild(div);

            
        }
    });
    
}

// Eventlistener for homepage icon/////////////////////////////////
homeicon.addEventListener('click',function(){
    console.log("clicked");
    messagearea.innerHTML='';
    qwerty.style.display="none";
    qwerty2.style.display="none";
    qwerty3.style.display="none";
    qwerty4.style.display="none";
    qwerty5.style.display="none";

    flag=false;

homepage();
});

function homepage(){
    activeroom="";
      qwerty.style.display="none";
      qwerty2.style.display="none";
      qwerty3.style.display="none";
      qwerty4.style.display="none";
      qwerty5.style.display="none";
      let img=document.createElement("img");
      img.setAttribute("class","img3");
      img.setAttribute("src","w4.png");
      messagearea.appendChild(img);
      localStorage.setItem("activeuser",activeuser);
   socket.emit("giveusers",activeuser);
}

socket.on("takeuser",(data)=>{
    console.log(data);
    homepage2(data);
})

function homepage2(data){
    console.log("homepage2",data);
     maindiv.innerHTML = '';
    data.forEach(element => {

        if (element.name != activeuser) {
            let div = document.createElement("div");
            div.setAttribute("class", "div");
             div.setAttribute("id",`${element.id}`);

            let image = document.createElement("img");
            image.setAttribute("class", "img");
            if(element.group==true)
            {
                image.src = "z9.png";
            }
            if(element.group==false)
            {
                image.src = "s8.png";  
            }


            let nameheading = document.createElement("h1");
            nameheading.setAttribute("class", "nameheading");
            nameheading.innerHTML = element.name;

            let span=document.createElement("span");
            span.setAttribute("class","lastmessage");
           
            if(element.lastmessage)
            {
                if(element.lastmessage.lastmessage)
                {
                span.innerHTML=element.lastmessage.lastmessage;
                }
                else
                {
                    span.innerHTML='';
                }
            }
            
            // if(element.lastmessage!=)
           
                
            div.appendChild(image);
            div.appendChild(nameheading);
            div.appendChild(span);
            maindiv.appendChild(div);
        }
    });
    usernames=maindiv.querySelectorAll(".nameheading");
    // lastmessagespan=document.querySelectorAll(".lastmessage");

}

socket.on("takemessagedetails",(data)=>{
  console.log("data=",data);

  for(let i=0;i<data.length;i++)
  {
   if(data[i].sentby==activeuser)
   {
    let message={
        sentby:data[i].sentby,
        message:data[i].message,
        lastmessage:data[i].lastmessage,
        time:data[i].time
    }
    appendmessage(message,'outgoing');
   }
   else
   {

    let message={
        sentby:data[i].sentby,
        message:data[i].message,
        lastmessage:data[i].lastmessage,
        time:data[i].time
    }
    appendmessage(message,'incoming');
   }
  }

});


searchbar.addEventListener('input',function(){
    console.log("entered");
 
 usernames.forEach(element=>{
    if(element.innerText.includes(searchbar.value))
    {
        element.parentNode.style.display="flex";
    }
    else
    {
        element.parentNode.style.display="none";
    }
 })
 

});

// let profileuser=document.getElementById("profileuser");
// profileicon.addEventListener('click',function(){
//     if(dialog.open)
//     {
//         dialog.open=false;
//     }
//     else
//     {
//         dialog.open=true;
//     }

// profileuser.innerText=localStorage.getItem("activeuser",activeuser);

// });

// dialog.addEventListener('click',()=>{
// dialog.open=false;

// });

$(document).ready(function () {
    let profileuser = document.getElementById("profileuser");
    $("#f8").click(function () {
        //   let profileuser=document.getElementById("profileuser");
        profileuser.innerText = localStorage.getItem("activeuser", activeuser);
        $("#dialog").fadeToggle(1500);

    });
});