//  TUTOR FILTER //
const classFilter =
    document.getElementById("classFilter");
const subjectFilter =
    document.getElementById("subjectFilter");
const tutorCards =
    document.querySelectorAll(".tutor-card");
function filterTutors() {
    const selectedClass =
        classFilter.value;
    const selectedSubject =
        subjectFilter.value;
    tutorCards.forEach(function(card) {
        const tutorClass =
            card.dataset.class;
        const tutorSubject =
            card.dataset.subject;
        const classMatch =
            selectedClass === "all" ||
            selectedClass === tutorClass;
        const subjectMatch =
            selectedSubject === "all" ||
            selectedSubject === tutorSubject;
        if (classMatch && subjectMatch) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}
classFilter.addEventListener(
    "change",
    filterTutors
);
subjectFilter.addEventListener(
    "change",
    filterTutors
);
//  VIEW TUTOR BUTTON //
const tutorButtons =
    document.querySelectorAll(".view-tutor");
tutorButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        alert(
            "Tutor details will be available soon!"
        );
    });
});