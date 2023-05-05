const editProdBt = [...document.querySelectorAll('.edit-product-button')]
const editProdField = [...document.querySelectorAll('.edit-product__field')]


const onEditHandler = (event) => {
    const index = editProdBt.findIndex((e) => e === event.target )

    editProdField[index].classList.toggle('active')

    const cancelBt = document.querySelectorAll('.cancel-edit')[index]

    const onCancelHandler = () => {
        editProdField[index].classList.toggle('active')
        cancelBt.removeEventListener('click',onCancelHandler)
    }

    cancelBt.addEventListener('click',onCancelHandler)

}

editProdBt.forEach(e => {
    return e.addEventListener('click',onEditHandler)
})