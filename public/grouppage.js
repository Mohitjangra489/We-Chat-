let socket = io();

let userdiv = document.getElementById("part2");
let groupname = document.getElementById("groupname");
let submitbtn = document.getElementById("submitbtn");



let activeuser;

homepage();

function homepage() {
    activeroom = "";

    activeuser = localStorage.getItem("activeuser", activeuser);
    socket.emit("givegrouppageusers", activeuser);
}

socket.on("takegrouppageusers", (data) => {
    data.forEach(element => {
        let div = document.createElement("div");
        div.setAttribute("class", "div");

        let image = document.createElement("img");
        image.setAttribute("class", "img");
        image.src = "man.png";

        let nameheading = document.createElement("h1");
        nameheading.setAttribute("class", "nameheading");
        nameheading.innerHTML = element;

        let newdiv2 = document.createElement("div");
        newdiv2.style = "display: flex;width: 300px;;";

        newdiv2.appendChild(image);
        newdiv2.appendChild(nameheading);


        let newdiv = document.createElement("div");
        newdiv.setAttribute("class", "checkbox-wrapper-26");
        newdiv.innerHTML = `
<div class="checkbox-wrapper-26" style="margin-left: 85vh;margin-top: 16px;">
  <input type="checkbox" id="${element}" value="${element}" class="checkbox">
  <label for="${element}">
    <div class="tick_mark"></div>
  </label>
</div>

`


        div.appendChild(newdiv2);
        div.appendChild(newdiv);
        userdiv.appendChild(div);
    });
})

submitbtn.addEventListener("click", function () {
    if (groupname.value != '') {
        let newgroupname = groupname.value;
        groupname.value = '';
        console.log(newgroupname);

        let users = document.querySelectorAll(".checkbox");
        console.log(users);
        let array=[];
        let loggeduser = localStorage.getItem("activeuser", activeuser);
        array.push(loggeduser);

     for(let i=0;i<users.length;i++)
     {
        if(users[i].checked==true)
        {
           array.push(users[i].value);
        }
     }

      users.forEach(element=>{
        element.checked=false;
      })
      
      let object = {
        groupname: newgroupname,
        users:array
         }
         socket.emit("creategroup",object);

    }
    });

