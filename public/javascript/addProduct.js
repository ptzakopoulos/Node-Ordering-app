const addProdBt = document.getElementById('add-product__button')
const addProdField = document.getElementById('add-product__field')
const cancelBt = document.getElementById('cancel')
const submitBt = document.getElementById('submit')

const addProductFieldHandler = () => {
    addProdField.classList.toggle('active')
    addProdBt.classList.toggle('innactive')
}

addProdBt.addEventListener('click',addProductFieldHandler)
cancelBt.addEventListener('click',addProductFieldHandler)

const inputs = [...document.querySelectorAll('.add-product__field .input')]

const onChangeHandler = () => {

    const formIsFilled = inputs.every(input => {
        return input.value.toString().trim().length > 0
    })
    console.log(formIsFilled)
    formIsFilled ? submitBt.disabled = false : submitBt.disabled = true 
}

inputs.forEach(e => {
    e.addEventListener('keydown',onChangeHandler)
})
