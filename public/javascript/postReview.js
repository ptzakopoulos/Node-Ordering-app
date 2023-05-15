const title = document.getElementById("title");
const content = document.getElementById("content");
const submit = document.getElementById("submit");

const onSubmitHandler = (e) => {
  const titleValue = title.value.trim();
  const contentValue = content.value.trim();

  if (titleValue.length < 4 || contentValue.length < 4) {
    e.preventDefault();
    titleValue.length < 4
      ? title.classList.add("invalid")
      : title.classList.remove("invalid");

    contentValue.length < 4
      ? content.classList.add("invalid")
      : content.classList.remove("invalid");
  }
};

const onFocusHandler = (e) => {
  e.target.classList.remove("invalid");
};

submit.addEventListener("click", onSubmitHandler);

title.addEventListener("focus", onFocusHandler);
content.addEventListener("focus", onFocusHandler);
title.addEventListener("blur", onSubmitHandler);
content.addEventListener("blur", onSubmitHandler);
