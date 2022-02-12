const modal = document.querySelector(".modal");
const formBlog = document.querySelector(".form-blog");
const btnSubmit = document.querySelector(".btn-submit");
const filterInput = document.querySelector("#filter-input");
const cardList = document.querySelector(".card-list");
const endpoint = "https://jsonserver-blogs.herokuapp.com/blogs";
let updateId = null;

//============================ Event click button appear modal ============================
const btnAdd = document.querySelector(".btn-add");
btnAdd.addEventListener("click", function() {
    btnSubmit.textContent = "Add course";
    updateId = null;
    formBlog.reset();

    modal.classList.toggle("is-show");
    modal.querySelector(".form-blog").style.display = "block";
})

//============================ Event click button hidden modal ============================
const btnCloseModal = document.querySelector(".modal-close");
btnCloseModal.addEventListener("click", function() {
    if (modal.classList.contains("is-show")) {
        modal.classList.remove("is-show");
        modal.querySelector(".blog-detail").style.display = "none";
        modal.querySelector(".form-blog").style.display = "none";
    }
})

//============================ Event click outside modal then hidden modal ============================
document.body.addEventListener("click", function (event) {
    if(event.target.matches(".modal") && modal.classList.contains("is-show")){ // Nhấn vào div modal rìa ngoài sẽ close
        modal.classList.remove("is-show");
        modal.querySelector(".blog-detail").style.display = "none";
        modal.querySelector(".form-blog").style.display = "none";
    }
});



//============================ Compressing blog content in a card ============================
function stringCompression(content) {
    const words = content.split(" ");
    if (words.length > 8) {
        const result = [];
        for (let i = 0; i <= 8; i++) {
            result.push(words[i]);
        }
        return result.join(" ") + "...";
    }
    return content;
}


//============================ Handle JSON Server ============================

function renderItemBlog(item) {
    const template = ` <div class="col l-4 m-6 c-12">
                            <div class="card-item" style="background: url(${item.image})top center / cover no-repeat;">
                                <div class="card-function">
                                    <div class="card-date">${item.publicDate}</div>
                                    <div class="card-icon">
                                        <div class="card-icon--item card-icon--edit" data-id ="${item.id}"><i class="uil uil-edit"></i></div>
                                        <div class="card-icon--item card-icon--remove" data-id ="${item.id}"><i class="uil uil-times-circle"></i></div>
                                    </div>
                                </div>
                                <div class="card-content">
                                    <a class="card-content--title" href="#">${item.title}</a>
                                    <p class="card-content--desc"></p>
                                    <p class="card-content--desc__hidden">${item.content}</p>
                                    <div class="hashtag">
                                    </div>
                                </div>
                            </div>
                        </div>`
    cardList.insertAdjacentHTML("beforeend", template);

}

// Handle display content card blog
function handleDisplayBlog() {
    // Handle compression blog's content
    const contentBlog = document.querySelectorAll(".card-content--desc");
    contentBlog.forEach(item => item.innerText = stringCompression(item.nextElementSibling.innerText));

    // Handle show detail blog
    const titleBLog = document.querySelectorAll(".card-content--title");
    titleBLog.forEach(item => item.addEventListener("click", function(e) {
        e.preventDefault();
        modal.classList.toggle("is-show");
        modal.querySelector(".blog-detail").style.display = "block";

        //? item = title
        // console.log(item.parentNode.parentNode.style.backgroundImage.slice(4, -1).replace(/"/g, "")); // Lấy hình ảnh
        const detailImg = document.querySelector(".blog-detail--img");
        const detailTitle = document.querySelector(".blog-detail--title");
        const detailContent = document.querySelector(".blog-detail--content");
        detailTitle.textContent = item.textContent; // title
        detailContent.textContent = item.nextElementSibling.nextElementSibling.textContent; // card-content--desc__hidden
        detailImg.setAttribute("src", item.parentNode.parentNode.style.backgroundImage.slice(4, -1).replace(/"/g, "")); // card-item
    }));
}

// Get current date
function getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    return today =  dd +'/' +  mm  + '/' + yyyy;
}


// * Get data blogs - API
const loading = document.querySelector(".image-loader");
async function getBlogs(link = endpoint) {
    loading.style.display = "block";

    const response = await fetch(link);
    const data = await response.json();
    cardList.innerHTML = ""; // Trước khi add data vào cardList-list thì xóa các item cũ đi để add mới
    if (data.length > 0 && Array.isArray(data)) {
        loading.style.display = "none";
        data.forEach(item => renderItemBlog(item));
    }

    // Add hashtag for blog card
    const cardItem = document.querySelectorAll(".card-item");
    for (let i = 0; i < data.length; i++) {
        for(const value of data[i].hashtags) {
            const template = `<div class="hashtag-item">${value}</div>`;
            cardItem[i].querySelector(".hashtag").insertAdjacentHTML("beforeend",template);
        }
    }

    handleDisplayBlog();
}
getBlogs();


//* Get single data blogs - API
async function getSingleBlog(id) {
    const response = await fetch(`${endpoint}/${id}`);
    const data = await response.json();
    return data;
}

// * Add new data blogs - API
async function addBlog({image, title, content, hashtags, publicDate}) {
    await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
        image,
        title,
        content,
        hashtags,
        publicDate
    }),
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    },
    })
    alert("Successfully add a new blog");
}

// * Remove data blogs - API
async function deleteBlog(id) {
    await fetch(`${endpoint}/${id}`, {
      method: 'DELETE',
    });
    alert("Successfully delete");
}

// * Edit data blogs - API
async function editBlog({id, image, title, content, hashtags, publicDate}) {
    await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            image,
            title,
            content,
            hashtags,
            publicDate
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })
    alert(`Successfully edit blog have id: #${id}`);
}


// * Filter data blogs - API



//============================ Event handle submit form ============================
if (formBlog) {
    formBlog.addEventListener("submit", async function(e) {
        e.preventDefault();
        // Handle white space before after hashtag
        const listHashtag = this.elements['hashtag'].value.split(",").map(item => {
            return item.trim();
        });

        if (!this.elements['image'].value || !this.elements['title'].value || !this.elements['content'].value || !this.elements['hashtag'].value) {
            return;
        }
    
        const blog = {
            image: this.elements['image'].value,
            title: this.elements['title'].value,
            content: this.elements['content'].value,
            hashtags: listHashtag,
            publicDate: getCurrentDate(),
        }
        updateId ? await editBlog({id: updateId, ...blog}) : await addBlog(blog);
        

        this.reset();
        await getBlogs();
        updateId = null;
        btnSubmit.textContent = "Add course";
    
        // Close modal
        modal.classList.remove("is-show");
        modal.querySelector(".blog-detail").style.display = "none";
        modal.querySelector(".form-blog").style.display = "none";
    });
}

//============================ Event click button remove ============================
cardList.addEventListener("click", async function(e) {
    console.log(e.target);
    if (e.target.matches(".card-icon--remove")){
        let checkComfirm = confirm("Are you sure to delete this blog?");
        if (checkComfirm) {
            const id = + e.target.dataset.id;
            await deleteBlog(id);
            await getBlogs();
        }
        return;
      }
      else if (e.target.matches(".card-icon--item")){
        const id = +e.target.dataset.id;
        modal.classList.toggle("is-show");
        modal.querySelector(".form-blog").style.display = "block";
        const dataBlog = await getSingleBlog(id);

        formBlog. elements['image'].value = dataBlog.image;
        formBlog. elements['title'].value = dataBlog.title;
        formBlog. elements['content'].value = dataBlog.content;
        formBlog. elements['hashtag'].value = dataBlog.hashtags.join(", ");
    
        btnSubmit.textContent = "Update course";
        // Khi click edit thì sẽ gán id cho biến check updateId, khi submit form sẽ kiểm tra biến này có giá trị chưa
        updateId = id; 
        return;
      }
})


//============================ Event keydown input filter list blog ============================
function debounceFn(func, wait, immediate) {
    let timeout;
    return function () {
        let context = this,
        args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
  }
filterInput.addEventListener("keydown", debounceFn(async function(e) {
    let path = endpoint; // Gán đường dẫn mặc định
    if (e.target.value) {
        path = `${endpoint}?title_like=${e.target.value}`;
    }
    loading.style.display = "block";
    await getBlogs(path);
    loading.style.display = "none";
},300));