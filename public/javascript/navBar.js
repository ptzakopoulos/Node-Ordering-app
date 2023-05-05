const navBar = document.getElementById('navBar')

const onScrollHandler = (e) => {

    if(pageYOffset > 0) {
        navBar.classList.add('onScroll')
    } else {
        navBar.classList.remove('onScroll')
    }
}

window.addEventListener('wheel',onScrollHandler)