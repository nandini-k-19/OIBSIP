/* =========================================================
   KOMALA NANDINI — CINEMATIC PORTFOLIO
   ========================================================= */


/* =========================================================
   1. DOM ELEMENTS
   ========================================================= */

const body = document.body;

const themeToggle = document.querySelector(".theme-toggle");

const menuButton = document.querySelector(".menu-button");

const mobileMenu = document.querySelector(".mobile-menu");

const mobileLinks = document.querySelectorAll(".mobile-menu a");

const cursorGlow = document.querySelector(".cursor-glow");


/* =========================================================
   2. DARK / LIGHT MODE
   ========================================================= */

function setTheme(theme) {

    if (theme === "light") {

        body.classList.add("light");

        if (themeToggle) {
            themeToggle.textContent = "☀";
            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );
        }

    } else {

        body.classList.remove("light");

        if (themeToggle) {
            themeToggle.textContent = "☾";
            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );
        }
    }

    localStorage.setItem(
        "portfolio-theme",
        theme
    );
}


/* =========================================================
   LOAD SAVED THEME
   ========================================================= */

const savedTheme =
    localStorage.getItem("portfolio-theme");

if (savedTheme) {

    setTheme(savedTheme);

} else {

    setTheme("dark");
}


/* =========================================================
   THEME TOGGLE
   ========================================================= */

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            const isLight =
                body.classList.contains("light");

            setTheme(
                isLight
                    ? "dark"
                    : "light"
            );
        }
    );
}


/* =========================================================
   3. MOBILE MENU
   ========================================================= */

if (menuButton) {

    menuButton.addEventListener(
        "click",
        () => {

            mobileMenu.classList.toggle("open");

            const opened =
                mobileMenu.classList.contains("open");

            menuButton.textContent =
                opened
                    ? "×"
                    : "☰";

            menuButton.setAttribute(
                "aria-expanded",
                opened
            );
        }
    );
}


/* =========================================================
   CLOSE MOBILE MENU
   ========================================================= */

mobileLinks.forEach(link => {

    link.addEventListener(
        "click",
        () => {

            mobileMenu.classList.remove("open");

            if (menuButton) {

                menuButton.textContent = "☰";

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );
});


/* =========================================================
   4. CURSOR GLOW
   ========================================================= */

if (cursorGlow) {

    window.addEventListener(
        "mousemove",
        (event) => {

            cursorGlow.style.left =
                `${event.clientX}px`;

            cursorGlow.style.top =
                `${event.clientY}px`;
        }
    );
}


/* =========================================================
   5. SCROLL REVEAL ANIMATION
   ========================================================= */

const revealElements =
    document.querySelectorAll(".reveal");


const revealObserver =
    new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

                    observer.unobserve(
                        entry.target
                    );
                }
            });

        },
        {
            threshold: 0.12
        }
    );


revealElements.forEach(element => {

    revealObserver.observe(element);

});


/* =========================================================
   6. ACTIVE NAVIGATION
   ========================================================= */

const sections =
    document.querySelectorAll("section[id]");

const navLinks =
    document.querySelectorAll(
        ".desktop-nav a"
    );


function updateActiveNavigation() {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 150;

        const sectionHeight =
            section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY <
                sectionTop + sectionHeight
        ) {

            currentSection =
                section.getAttribute("id");
        }
    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        const href =
            link.getAttribute("href");

        if (
            href === `#${currentSection}`
        ) {

            link.classList.add("active");
        }
    });
}


window.addEventListener(
    "scroll",
    updateActiveNavigation
);


/* =========================================================
   7. NAVBAR SCROLL EFFECT
   ========================================================= */

const navbar =
    document.querySelector(".navbar");


window.addEventListener(
    "scroll",
    () => {

        if (!navbar) return;

        if (window.scrollY > 50) {

            navbar.classList.add(
                "scrolled"
            );

        } else {

            navbar.classList.remove(
                "scrolled"
            );
        }
    }
);


/* =========================================================
   8. TYPING EFFECT
   ========================================================= */

const typingElement =
    document.querySelector(
        ".typing-text"
    );


const typingWords = [

    "Python Full-Stack Developer",

    "Web Developer",

    "Backend Developer",

    "Software Engineer"

];


let wordIndex = 0;

let characterIndex = 0;

let deleting = false;


function typeEffect() {

    if (!typingElement) return;


    const currentWord =
        typingWords[wordIndex];


    if (!deleting) {

        typingElement.textContent =
            currentWord.substring(
                0,
                characterIndex + 1
            );

        characterIndex++;


        if (
            characterIndex ===
            currentWord.length
        ) {

            deleting = true;

            setTimeout(
                typeEffect,
                1500
            );

            return;
        }

    } else {

        typingElement.textContent =
            currentWord.substring(
                0,
                characterIndex - 1
            );

        characterIndex--;


        if (characterIndex === 0) {

            deleting = false;

            wordIndex =
                (wordIndex + 1) %
                typingWords.length;
        }
    }


    setTimeout(
        typeEffect,
        deleting
            ? 55
            : 95
    );
}


typeEffect();


/* =========================================================
   9. HERO PARALLAX
   ========================================================= */

const heroVisual =
    document.querySelector(
        ".hero-visual"
    );


if (heroVisual) {

    window.addEventListener(
        "mousemove",
        event => {

            const rect =
                heroVisual.getBoundingClientRect();

            const x =
                (event.clientX - rect.left)
                / rect.width
                - 0.5;

            const y =
                (event.clientY - rect.top)
                / rect.height
                - 0.5;


            const profile =
                document.querySelector(
                    ".profile-frame"
                );


            if (profile) {

                profile.style.transform =
                    `rotate(${x * 3}deg)
                     translate(${x * 8}px,
                     ${y * 8}px)`;
            }
        }
    );
}


/* =========================================================
   10. MAGNETIC BUTTON EFFECT
   ========================================================= */

const magneticButtons =
    document.querySelectorAll(
        ".primary-button, .secondary-button"
    );


magneticButtons.forEach(button => {

    button.addEventListener(
        "mousemove",
        event => {

            const rect =
                button.getBoundingClientRect();

            const x =
                event.clientX -
                rect.left -
                rect.width / 2;

            const y =
                event.clientY -
                rect.top -
                rect.height / 2;


            button.style.transform =
                `translate(${x * 0.12}px,
                 ${y * 0.12}px)`;
        }
    );


    button.addEventListener(
        "mouseleave",
        () => {

            button.style.transform =
                "";
        }
    );
});


/* =========================================================
   11. PROJECT CARD TILT
   ========================================================= */

const cards =
    document.querySelectorAll(
        ".skill-card, .small-project, .achievement, .strength-card"
    );


cards.forEach(card => {

    card.addEventListener(
        "mousemove",
        event => {

            const rect =
                card.getBoundingClientRect();

            const x =
                event.clientX -
                rect.left;

            const y =
                event.clientY -
                rect.top;


            const centerX =
                rect.width / 2;

            const centerY =
                rect.height / 2;


            const rotateX =
                (y - centerY) /
                20;

            const rotateY =
                (centerX - x) /
                20;


            card.style.transform =
                `perspective(700px)
                 rotateX(${rotateX}deg)
                 rotateY(${rotateY}deg)
                 translateY(-7px)`;
        }
    );


    card.addEventListener(
        "mouseleave",
        () => {

            card.style.transform =
                "";
        }
    );
});


/* =========================================================
   12. COUNTER ANIMATION
   ========================================================= */

const counters =
    document.querySelectorAll(
        "[data-counter]"
    );


function animateCounter(element) {

    const target =
        Number(
            element.dataset.counter
        );

    let current = 0;

    const duration = 1200;

    const startTime =
        performance.now();


    function updateCounter(time) {

        const progress =
            Math.min(
                (time - startTime) /
                duration,
                1
            );


        current =
            Math.floor(
                progress * target
            );


        element.textContent =
            current;


        if (progress < 1) {

            requestAnimationFrame(
                updateCounter
            );

        } else {

            element.textContent =
                target;
        }
    }


    requestAnimationFrame(
        updateCounter
    );
}


const counterObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (
                    entry.isIntersecting
                ) {

                    animateCounter(
                        entry.target
                    );

                    counterObserver.unobserve(
                        entry.target
                    );
                }
            });

        },
        {
            threshold: 0.8
        }
    );


counters.forEach(counter => {

    counterObserver.observe(counter);

});


/* =========================================================
   13. CONTACT YEAR
   ========================================================= */

const yearElement =
    document.querySelector(
        ".current-year"
    );


if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();
}


/* =========================================================
   14. SMOOTH ANCHOR SCROLL
   ========================================================= */

document.querySelectorAll(
    'a[href^="#"]'
).forEach(link => {

    link.addEventListener(
        "click",
        event => {

            const targetId =
                link.getAttribute(
                    "href"
                );

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }


            const target =
                document.querySelector(
                    targetId
                );


            if (!target) return;


            event.preventDefault();


            const navbarHeight =
                navbar
                    ? navbar.offsetHeight
                    : 0;


            const targetPosition =
                target.offsetTop -
                navbarHeight;


            window.scrollTo({

                top:
                    targetPosition,

                behavior:
                    "smooth"
            });
        }
    );
});


/* =========================================================
   15. PAGE LOADING ANIMATION
   ========================================================= */

window.addEventListener(
    "load",
    () => {

        document.body.classList.add(
            "loaded"
        );

        updateActiveNavigation();
    }
);


/* =========================================================
   16. KEYBOARD ACCESSIBILITY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            if (
                mobileMenu &&
                mobileMenu.classList.contains(
                    "open"
                )
            ) {

                mobileMenu.classList.remove(
                    "open"
                );

                if (menuButton) {

                    menuButton.textContent =
                        "☰";

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
        }
    }
);


/* =========================================================
   17. PREVENT BROKEN IMAGE EXPERIENCE
   ========================================================= */

const images =
    document.querySelectorAll(
        "img"
    );


images.forEach(image => {

    image.addEventListener(
        "error",
        () => {

            image.classList.add(
                "image-error"
            );
        }
    );
});


/* =========================================================
   18. CONSOLE MESSAGE
   ========================================================= */

console.log(
    "%cKomala Nandini Portfolio",
    "font-size:20px;font-weight:bold;"
);

console.log(
    "%cPython Full-Stack Developer",
    "font-size:14px;"
);

console.log(
    "Welcome to my portfolio 🚀"
);