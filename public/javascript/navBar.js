const navBar = document.getElementById('navBar')

const onScrollHandler = (e) => {

    if(pageYOffset > 50) {
        navBar.classList.add('onScroll')
    } else {
        navBar.classList.remove('onScroll')
    }
}

window.addEventListener('wheel',onScrollHandler)