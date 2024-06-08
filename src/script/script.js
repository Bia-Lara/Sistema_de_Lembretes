
let form = $("form")[0]
let button = $("button")[0]
let pathname= window.location.pathname

form.addEventListener("submit", login)
button.addEventListener("click", login)

$(document).ready(function() {
    $.ajax({
        url:"https://ifsp.ddns.net/webservices/lembretes/usuario/check",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + getToken()
        },

        success:function(msg){
            console.log(msg)
            if(msg.msg=='Você está logado'){
                console.log("foi")
                updateToken()
            }
        },

        error:function(request, status, erro){
            console.log(erro)
        }
    })

})


function login(e){
    e.preventDefault()
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


