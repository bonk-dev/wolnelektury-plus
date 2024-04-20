import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away-subtle.css';

class Annotation {
    // number inside the square brackets (e.g. [71])
    ordinal

    // the clickable annotation in the original text
    anchorElement

    // sourced from footnote <em></em>
    annotatedText

    // text outside the <em></em> in footnote
    explanation
    constructor(annotationElement) {
        this.anchorElement = annotationElement.previousSibling;
        this.ordinal = parseInt(annotationElement
            .innerText
            .replace('[', '')
            .replace(']', ''));

        const nameWithHash = new URL(annotationElement.href).hash;
        const nameNoHash = nameWithHash.replace('#', '');
        const footnoteQuery = `a[name='${nameNoHash}']`;

        const footnoteElement = document.querySelector(footnoteQuery);
        const footnoteText = footnoteElement
            .parentElement
            .querySelector('p');

        if (footnoteText == null) {
            console.error('Annotation element is null');
            console.debug(annotationElement);
            console.debug(nameWithHash);
        }

        const concat = footnoteText.innerText;
        this.annotatedText = footnoteText.querySelector('em').innerText;
        this.explanation = concat
            .replace(this.annotatedText, '')
            .trim();
    }

    surroundAnnotatedText(tag, className) {
        const htmlText = this.anchorElement
            .previousSibling;

        const spaceRegex = /\s+/;
        const annotatedWordCount = this.annotatedText.split(spaceRegex).length;
        const textWords = htmlText.textContent.split(spaceRegex);
        const originalWordCount = Math.max(0, Math.min(textWords.length, textWords.length - annotatedWordCount));

        let originalText = '';
        for (let i = 0; i < originalWordCount; ++i) {
            originalText += textWords[i] + ' ';
        }
        let annotatedText = '';
        for (let j = originalWordCount; j < textWords.length; ++j) {
            annotatedText += textWords[j] + ' ';
        }
        annotatedText = annotatedText.trimEnd();

        const element = document.createElement(tag);
        element.className = className;
        htmlText.parentElement.insertBefore(element, htmlText.nextSibling);

        htmlText.textContent = originalText;
        element.innerText = annotatedText;

        return element;
    }
}

const findAnnotations = () => {
    /*
     * A single page containts multiple verses:
     * <div class='verse'>
     *    [verse text]
     *    <a name="anchor-idm285"></a>
     *    <a href="#footnote-idm285" class="annotation">[71]</a>
     *    <a>
     * </div>
     *
     * The code is not clearly showing what verse text it is annotating, but this can be deduced from
     * the actual footnote text.
     * */

    const annotations = document.querySelectorAll('a:not(div#footnotes a).annotation');
    let annotationObjects = [];
    for (let annotationElement of annotations) {
        annotationObjects.push(new Annotation(annotationElement));
    }
    return annotationObjects;
};

console.group("WolneLektury+");
try {
    let annotations = findAnnotations();
    console.log("Używa tippy.js (https://www.npmjs.com/package/tippy.js)");
    console.log("Znalezione adnotacje: " + annotations.length);

    for (let ann of annotations) {
        const surroundElement = ann.surroundAnnotatedText('span', 'wlplus-clickable-annotation wlplus-highlight');
        surroundElement.dataset.tippyContent = `${ann.annotatedText} - ${ann.explanation}`;
    }

    tippy('[data-tippy-content]', {
        animation: 'shift-away-subtle'
    });
}
finally {
    console.groupEnd();
}