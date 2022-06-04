console.log("Hello from countInputFiles");
const images = document.querySelector('#images');
const image_label = document.querySelector('#image_label')
const btn = document.querySelector('#btn');

console.dir(images);
const files = [...images.files];

images.addEventListener('change', () => {
    const files = [...images.files];
    if (files.length === 1) {
        image_label.innerHTML = `${files.length} file selected`;
        image_label.innerText = `${files.length} file selected`;
    }
    else {
        image_label.innerHTML = `${files.length} files selected`;
        image_label.innerText = `${files.length} files selected`;
    }
    console.dir(image_label);
})

btn.addEventListener('click', (e) => {
    const files = [...images.files];
    if(files.length === 0) {
        e.preventDefault()
        image_label.innerHTML = `Must select one file at least`;
        image_label.innerText = `Must select one file at least`;
    }
})