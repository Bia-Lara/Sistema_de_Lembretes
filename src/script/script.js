let form = $("form")[0]
let button = $(".buttonForm")[0]
let logout
let pathname= window.location.pathname
let notesUrl = "https://ifsp.ddns.net/webservices/lembretes/lembrete/";
let tokenTimer = null

//CHAMADAS DE FUNÇÕES---------------------------------------------------------------

form.addEventListener("submit", (e)=>{
    e.preventDefault()
    
    if(pathname.includes("/src/login.html")){
        login()
    }

    if(pathname.includes("/src/cadastro.html")){
        
        register()
    }

    if(pathname.includes("/src/lembretes.html")){
        registerReminder()
    }

    
})

button.addEventListener("click", (e)=>{
    e.preventDefault()

    if(pathname.includes("/src/login.html")){
        login()
    }

    if(pathname.includes("/src/cadastro.html")){
        register()
    }

    if(pathname.includes("/src/lembretes.html")){
        registerReminder()
        
    }
})

if(pathname.includes("/src/lembretes.html")){
    logout = $("#logout")[0]

    logout.addEventListener("click", (e)=>{
        $.ajax({
            url: "https://ifsp.ddns.net/webservices/lembretes/usuario/logout",
            type: "GET",
            headers: {
                'Authorization': 'Bearer ' + getToken()
            },
    
            success: function(msg){
               
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

    $(document).on('click',".deleteBtn", function(e) {
            e.preventDefault();
            let targetReminder = $(this).closest('[data-id]');
            let reminderId = targetReminder.attr('data-id');
            deleteReminder(reminderId,targetReminder)
    })

    $(document).on('click',".editBtn", function(e) {
        e.preventDefault();
        $('#janelaEdicao').css('display', 'block');
        $('#janelaEdicaoFundo').css('display', 'block');
        let targetReminder = $(this).closest('[data-id]');
        let reminderId = targetReminder.attr('data-id');
        $('#IdTarefaEdicao').text(reminderId)
        $('#btnAtualiza').data('targetReminder', targetReminder);
        $('#btnAtualiza').data('reminderId', reminderId);
    })

    $(document).on('click','#btnAtualiza',function(e){
        e.preventDefault();
        let targetReminder = $(this).data('targetReminder');
        let reminderId = $(this).data('reminderId');
        editReminder(reminderId,targetReminder)
        $('#janelaEdicao').css('display', 'none');
        $('#janelaEdicaoFundo').css('display', 'none');
    })

    $(document).on('click',"#fechar", function(e) {
        e.preventDefault();
        $('#janelaEdicao').css('display', 'none');
        $('#janelaEdicaoFundo').css('display', 'none');
    })

    
}

$(document).ready(function() {
    if(pathname.includes("/src/login.html") || pathname.includes("/src/cadastro.html")){
        $('#email').inputmask({
            alias: "email",
            clearIncomplete: true
            
        });
    }
    else{
        $.ajax({
            url: notesUrl + "lembrete",
            type: "GET",
            headers: {
                "authorization": `Bearer ${getToken()}` 
            },
            success:showContent,
            error: (error) => {
                console.error("erro:", error);
            }
        })
    }
    if(pathname.includes("/src/login.html")){
        $.ajax({
            url:"https://ifsp.ddns.net/webservices/lembretes/usuario/check",
            type: "GET",
            headers: {
                'Authorization': 'Bearer ' + getToken()
            },
            success:function(msg){
                if(pathname.includes("/src/login.html")){
                    if(msg.msg=='Você está logado'){
                        updateToken()
                    }
                }
            },
            error:function(request, status, erro){
                console.log(request.responseJSON.msg);
            }
        
        })
    }

})


//Funções da página de lembretes----------------------------------------------------------------------------

function registerReminder(){
    let content = $("form textarea").val();
    if(content.length <= 255 && content.length > 0){
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                texto: content
            }),
        }
        fetch(notesUrl + "lembrete", options)
        .then(response => response.json())
        .then(data => {
            let reminderCard = $("<div>").addClass("reminder").attr("data-id",data.id);
            let taskDiv = $("<div>").addClass("task").text(data.texto)
            let buttonsDiv = $("<div>").addClass("buttons")
            let editBtn = $("<button>").addClass("editBtn").append($("<img>").attr("src", "img/lapis.png"));
            let deleteBtn = $("<button>").addClass("deleteBtn").append($("<img>").attr("src", "img/lixeira-de-reciclagem.png"));
        
            buttonsDiv.append(editBtn).append(deleteBtn);
            reminderCard.append(taskDiv).append(buttonsDiv);
            $(".reminders").prepend(reminderCard);
            $('textarea').val('');
        })
    }
    else{
        alert("Erro! Conteudo vázio ou maior que 255 caracteres")
    }
}

function showContent(data){
    data.map(data => {
        let reminderCard = $("<div>").addClass("reminder").attr("data-id",data.id);
        let taskDiv = $("<div>").addClass("task").text(data.texto)
        let dataDiv = $("<div>").addClass("data").text(data.data)
        let buttonsDiv = $("<div>").addClass("buttons")
        let editBtn = $("<button>").addClass("editBtn").append($("<img>").attr("src", "img/lapis.png"));
        let deleteBtn = $("<button>").addClass("deleteBtn").append($("<img>").attr("src", "img/lixeira-de-reciclagem.png"));
        
        buttonsDiv.append(editBtn).append(deleteBtn);
        reminderCard.append(taskDiv).append(dataDiv).append(buttonsDiv);

        $(".reminders").append(reminderCard);
    })
}

function deleteReminder(reminderId,targetReminder){
    let options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    }

    fetch(notesUrl + reminderId,options)
    .then(response => {
        if (!response.ok)
        {
            throw new Error("Ocorreu um erro!");
        }
        return response.json();
    })
    .then(remove => {
        targetReminder.remove();
        AlertDel(remove.msg)
        
    })
}

function editReminder(reminderId,targetReminder){
    let content = $("#editText").val();
    $('#editText').val('');
    if(content.length <= 255 && content.length > 0){
        let options = {
            method: "PUT",
            body: JSON.stringify({
                texto: content,
            }),
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                "Content-Type":"application/json"
            },
        }
        fetch(notesUrl+reminderId,options)
            .then(response => {
                if (!response.ok)
                {
                    throw new Error("Ocorreu um erro!");
                }
                return response.json();
            })
            .then(data => {
                targetReminder.children('div:first').text(data.texto) 
            })
            .catch(error =>{
                console.error("Erro encontrado: ",error);
            })
    }
    else{
        alert("Erro! Conteudo vázio ou maior que 255 caracteres")
    }
    
}

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
                setTokenExpirationTime(Date.now() + 180 * 1000)
                clearInterval(tokenTimer)
                startTokenTimer(180)
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

    if(email=="" || senha==""){
        span.innerHTML = `Por favor preencha todos os campos! `
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
                setTokenExpirationTime(Date.now() + 180 * 1000)
                window.location.href = "lembretes.html"
            },

            error: function(request, status, erro){
                span.innerHTML = request.responseJSON.msg
                span.style.display="block"
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
            setToken(msg.token)
            setTokenExpirationTime(Date.now() + 180 * 1000)
            clearInterval(tokenTimer)
            startTokenTimer(180)
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
function startTokenTimer(duration) {
    let timer = duration, minutes, seconds;
    let display = $("#timer");

    // Limpa o timer existente, se houver
    if (tokenTimer) {
        clearInterval(tokenTimer);
    }

    tokenTimer = setInterval(function() {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display[0].textContent = `${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(tokenTimer)
            AlertModal()
        }
    }, 1000);
}

function AlertModal(){

    if ($('#janelaEdicao').css('display') === 'block') {
        $('#janelaEdicao').css('display', 'none')
    }

    $('#janelaAviso').css('display', 'block')
    $('#janelaEdicaoFundo').css('display', 'block')

    $('#buttonAviso').on('click', function(e){
        window.location.href = "login.html"
    })
}

function AlertDel(msg){

    if ($('#janelaEdicao').css('display') === 'block') {
        $('#janelaEdicao').css('display', 'none')
    }

    $('#avisoDelete').css('display', 'block')
    $('#janelaEdicaoFundo').css('display', 'block')
    $('#deleteMsg').text(msg);

    $('#buttonDel').on('click', function(e){
        $('#avisoDelete').css('display', 'none')
        $('#janelaEdicaoFundo').css('display', 'none')
        $('#janelaEdicao').css('display', 'none')
    })
}