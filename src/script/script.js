
let form = $("form")[0]
let button = $(".buttonForm")[0]
let logout
let pathname= window.location.pathname


//CHAMADAS DE FUNÇÕES---------------------------------------------------------------

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

if(pathname=="/src/lembretes.html"){
    logout = $("#logout")[0]

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

    const expirationTime = getTokenExpirationTime();
    if (expirationTime) {
        const timeRemaining = Math.max(expirationTime - Date.now(), 0) / 1000;
        startTokenTimer(timeRemaining);
    } else {
        startTokenTimer(180); // 180 segundos = 3 minutos
    }

    
}

$(document).ready(function() {
    if(pathname=="/src/login.html" || pathname=="/src/cadastro.html"){
        $('#email').inputmask({
            alias: "email",
            clearIncomplete: true
            
        });
    }
    
    $.ajax({
        url:"https://ifsp.ddns.net/webservices/lembretes/usuario/check",
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + getToken()
        },

        success:function(msg){
            console.log(msg)
            if(pathname=="/src/login.html"){
                if(msg.msg=='Você está logado'){
                    updateToken()
                }
            }
        },

        error:function(request, status, erro){
            console.log(erro)
        }
    })

})


//FUNÇÕES DE AUTENTICAÇÃO------------------------------------------------------------

function login(){
    let email = $('#email')
    let senha = $('#password')
    let span = $("span")[0]

    if(email.val()=="" || senha.val()==""){
        span.innerHTML = `Por favor preencha todos os campos! `
        span.style.display="block"
    }else{
        $.ajax({
            url: "https://ifsp.ddns.net/webservices/lembretes/usuario/login",
            type: "POST",
            
            data: {
                "login":email.val(),
                "senha": senha.val()
            },
            
            success: function(msg){
                setToken(msg.token)
                
                window.location.href = "lembretes.html"
            },

            error: function(request, status, erro){
            span.innerHTML="Essa conta não existe!"
            span.style.display= "block"
            email.val("")
            senha.val("")
            }
        })
    }

    
}

function register(){
    let email = $('#email').val();
    let senha = $('#password').val()
    let span= $("span")[0]

    let senhaValida = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;
    if(email=="" || senha==""){
        span.innerHTML = `Por favor preencha todos os campos! `
        span.style.display="block"
    }
    else if(!senhaValida.test(senha)){
        span.innerHTML = `Por favor insira uma senha válida<br>*Mínimo 6 caracteres<br>*Mínimo uma letra maiúscula<br>*Mínimo um número<br>*Mínimo um caractere Especial `
       
        span.style.display="block"
    }else{
        $.ajax({
            url: "https://ifsp.ddns.net/webservices/lembretes/usuario/signup",
            type: "POST",
            
            data: {
                "login":email,
                "senha": senha
            },

            success: function(msg){
                setToken(msg.token)
                setTokenExpirationTime(Date.now() + 180 * 1000);
                window.location.href = "lembretes.html"
            },

            error: function(request, status, erro){
                console.log(erro)
            }
        })
    }

    
}


//FUNÇÕES DO TOKEN------------------------------------------------------------------

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
            setTokenExpirationTime(Date.now() + 180 * 1000);
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

function setTokenExpirationTime(expirationTime) {
    if (typeof (Storage) !== "undefined") {
        localStorage.setItem("tokenExpirationTime", expirationTime);
    } else {
        alert("Ocorreu um erro! Por favor Recarregue a página!")
    }
}

function getTokenExpirationTime() {
    if (typeof (Storage) !== "undefined") {
        return parseInt(localStorage.getItem("tokenExpirationTime"), 10);
    } else {
        alert("Ocorreu um erro! Por favor Recarregue a página!")
    }
    return null;
}

function startTokenTimer(duration){
    let timer = duration, minutes, seconds
    let display = $("#timer")
    let countdown = setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10)

        minutes = minutes < 10 ? "0" + minutes : minutes
        seconds = seconds < 10 ? "0" + seconds : seconds

        display[0].textContent = `${minutes}:${seconds}`

        if (--timer < 0) {
            clearInterval(countdown)
            alert('Seu token expirou. Por favor, faça login novamente.')
            window.location.href = "login.html"
        }
    }, 1000);
}
