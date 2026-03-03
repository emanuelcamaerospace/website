const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add("visible");
        }
    });
});
document.querySelectorAll(".section, .card").forEach(el => {
    el.classList.add("fade-in");
    observer.observe(el);
});