
let form = $("form")[0]
let button = $("input button")[0]
let logout = $("#logout")[0]
let pathname= window.location.pathname
console.log(pathname)
form.addEventListener("submit", (e)=>{
    e.preventDefault()

    if(pathname=="/src/login.html"){
        login()
    }

    if(pathname=="/src/cadastro.html"){
        register()
    }

    if(pathname=="/src/lembretes.html"){
        registerReminder()
    }
})
button.addEventListener("click", (e)=>{
    e.preventDefault()

    if(pathname=="/src/login.html"){
        login()
    }

    if(pathname=="/src/cadastro.html"){
        register()
    }

    if(pathname=="/src/lembretes.html"){
        registerReminder()
    }
})

logout.addEventListener("click", (e)=>{
    $.ajax({
        url: "https://ifsp.ddns.net/webservices/lembretes/usuario/logout",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + getToken()
        },

        success: function(msg){
            console.log(msg)
            window.location.href = "login.html"
        },

        error: function(request, status, erro){
           console.log(erro)
        }
    })
})


$(document).ready(function() {
    $.ajax({
        url:"https://ifsp.ddns.net/webservices/lembretes/usuario/check",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + getToken()
        },

        success:function(msg){
            if(msg.msg=='Você está logado'){
                updateToken()
            }
        },

        error:function(request, status, erro){
            console.log(erro)
        }
    })

})

function login(){
    let email = $('#email').val();
    let senha = $('#password').val()

    $.ajax({
        url: "https://ifsp.ddns.net/webservices/lembretes/usuario/login",
        type: "POST",
        
        data: {
            "login":email,
            "senha": senha
        },

        success: function(msg){
            setToken(msg.token)
            window.location.href = "lembretes.html"
        },

        error: function(request, status, erro){
            alert("Essa conta não existe! Por favor cadastre-se em nosso site!")
        }
    })
}

function register(){
    let email = $('#email').val();
    let senha = $('#password').val()

    $.ajax({
        url: "https://ifsp.ddns.net/webservices/lembretes/usuario/signup",
        type: "POST",
        
        data: {
            "login":email,
            "senha": senha
        },

        success: function(msg){
            setToken(msg.token)
            window.location.href = "lembretes.html"
        },

        error: function(request, status, erro){
            alert("Usuário ja cadastrado!!")
        }
    })
}

function updateToken(){
    $.ajax({
        url:"https://ifsp.ddns.net/webservices/lembretes/usuario/renew",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + getToken()
        },

        success: function(msg){
            console.log(msg.token)
            setToken(msg.token)
            window.location.href = "lembretes.html"
        },

        error: function(request, status, erro){
            alert("Essa conta não existe! Por favor cadastre-se em nosso site!")
        }
    })
}

function setToken(token){
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("token", token);
    }else {
        alert("Ocorreu um erro! Por favor Recarregue a página!")
    }
}

function getToken(){
    if (typeof(Storage) !== "undefined") {
        if(localStorage.getItem("token")){
            return localStorage.getItem("token")
        }else{
            return null
        }
        
    }else {
        alert("Ocorreu um erro! Por favor Recarregue a página!")
    }
}


