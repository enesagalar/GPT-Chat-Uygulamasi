const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const ThemeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "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";
const initialHeight = chatInput.scrollHeight;

const loadDataFromLocalstorage = () =>{
    const themeColor = localStorage.getItem("theme-color");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    ThemeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `
    <div class="default-text">
    <h1>EnesGPT Hoşgeldiniz</h1>
    <p>Size nasıl yaprdımcı olabilirim?</p>
    </div>
    `

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}
loadDataFromLocalstorage();

const createElement = (html, className) =>{

    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;

}

const getChatResponse = async (incomingChatDiv) =>{
    const API_URL ="https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");


    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        }, 
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        })
    }

    try{
        const reponse = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = reponse.choices[0].text.trim();
    }catch(error){
        pElement.classList.add("error");
        pElement.textContent = "Bir şeyler ters gitti. Lütfen tekrar deneyin."
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
}

const copyResponse = (copyBtn) =>{

    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000 );
} 

const showTypingAnimation = () =>{

    const html = ` <div class="chat-content">
    <div class="chat-details">
        <img src="images/chatbot.jpg" alt="chatbot-img">
        <div class="typing-animation">
            <div class="typing-dot" style="--delay: 0.2s"></div>
            <div class="typing-dot" style="--delay: 0.3s"></div>
            <div class="typing-dot" style="--delay: 0.4s"></div>
        </div>
    </div>
    <span onclick="copyResponse(this)" class="material-symbols-outlined">content_copy</span>
</div>`;

    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);

}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if(!userText) return;

    chatInput.value="";
    chatInput.style.height = `${initialHeight}px`;

    const html = `<div class="chat-content">
    <div class="chat-details">
        <img src="images/user.jpg" alt="user-img">
        <p></p>
    </div>
    </div>`;

    const outgoingChatDiv = createElement(html, "outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500)
}

ThemeButton.addEventListener("click", () => {
    // karanlık ve aydınlık mod
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", ThemeButton.innerText);
    ThemeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

});

deleteButton.addEventListener("click", () => {
    // tüm chati silme
    if(confirm("Tüm konuştuklarımızı silmek istediğine emin misin ?")){
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

chatInput.addEventListener("input", () =>{
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) =>{
    if(e.key === "Enter" && !e.shiftKey  && window.innerWidth > 800){
        e.preventDefault();
        handleOutgoingChat();
    }
});

sendButton.addEventListener("click", handleOutgoingChat);