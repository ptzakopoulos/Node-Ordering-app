const addToCartBt =[...document.querySelectorAll('.addToCartBt')]
const loadingScreen = document.getElementById('loading-screen')

const loadingHandler = () => {
    loadingScreen.style.display = 'flex'
}

addToCartBt.forEach(e => {
    e.addEventListener('click',loadingHandler)
})