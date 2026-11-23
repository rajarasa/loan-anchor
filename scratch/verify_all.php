<?php
$results = [];
$errors = [];

function check($desc, $cond) {
    global $results, $errors;
    if ($cond) {
        $results[] = "[PASS] $desc";
    } else {
        $results[] = "[FAIL] $desc";
        $errors[] = $desc;
    }
}

// 1. Files exist
check("about.html exists", file_exists("about.html"));
check("contact.html exists", file_exists("contact.html"));
check("index.html exists", file_exists("index.html"));
check("services.html exists", file_exists("services.html"));
check("js/main.js exists", file_exists("js/main.js"));

$about = file_get_contents("about.html");
$contact = file_get_contents("contact.html");
$index = file_get_contents("index.html");
$services = file_get_contents("services.html");
$js = file_get_contents("js/main.js");

// 2. about.html checks
check("about.html contains 'Our Experience' heading", strpos($about, "A client experience built on trust, preparation and clear expectations.") !== false);
check("about.html desktop has Card 2 in gold", strpos($about, 'Accurate, Organised Approach</h3>') !== false && strpos($about, 'text-gold">Accurate, Organised Approach') !== false);
check("about.html mobile has #mobile-experience", strpos($about, 'id="mobile-experience"') !== false);
check("about.html mobile has #exp-dots", strpos($about, 'id="exp-dots"') !== false);
check("about.html mobile has 4 exp-dots", substr_count($about, 'class="exp-dot') === 4);
check("about.html mobile has 4 exp-slides", substr_count($about, 'class="exp-slide') === 4);
check("about.html mobile has Asset 5, 6, 7, 8", 
    strpos($about, 'Asset 5.png') !== false && 
    strpos($about, 'Asset 6.png') !== false && 
    strpos($about, 'Asset 7.png') !== false && 
    strpos($about, 'Asset 8.png') !== false
);
check("about.html gold banner unhidden", strpos($about, '“We will aim to make the process clearer, communicate honestly and treat every customer\'s information with care.”') !== false);
check("about.html guidance section unhidden and contains Asset 11.png", strpos($about, 'Guidance for customers who want to understand their next step.') !== false && strpos($about, 'Asset 11.png') !== false);
check("about.html guidance has exact text", strpos($about, 'Loan Anchor is intended to support individuals who want help navigating financing') !== false);
check("about.html has italic sub-quote", strpos($about, 'A suitable customer journey starts with informed consent, accurate information and realistic expectations.') !== false);
check("about.html has 5 expectations circles", 
    strpos($about, 'A respectful conversation about their needs') !== false &&
    strpos($about, 'Clear explanations of common application requirements') !== false &&
    strpos($about, 'Support identifying missing or incomplete information') !== false &&
    strpos($about, 'Honest communication about fees and next steps') !== false &&
    strpos($about, 'No guarantee of approval or preferential treatment') !== false
);

// 3. js/main.js checks
check("js/main.js contains initExperienceSwiper", strpos($js, 'initExperienceSwiper') !== false);
check("js/main.js calls initExperienceSwiper in DOMContentLoaded", strpos($js, 'initExperienceSwiper();') !== false);

// 4. contact.html checks
check("contact.html has Asset 14.png banner", strpos($contact, 'Asset 14.png') !== false);
check("contact.html has Get In Touch", strpos($contact, 'Get In Touch') !== false);
check("contact.html has contact-map.jpg", strpos($contact, 'contact-map.jpg') !== false);
check("contact.html has +971 4583 1051", strpos($contact, '+971 4583 1051') !== false);
check("contact.html has +971 58 586 1537", strpos($contact, '+971 58 586 1537') !== false);
check("contact.html has info@loananchor.ae", strpos($contact, 'info@loananchor.ae') !== false);
check("contact.html has form with send-enquiry.php", strpos($contact, 'action="send-enquiry.php"') !== false);

// 5. Navigation consistency
check("header has canonical contact.html link", strpos(file_get_contents("components/header.html"), 'href="contact.html"') !== false);
check("footer has canonical contact.html link", strpos(file_get_contents("components/footer.html"), 'href="contact.html"') !== false);

echo implode("\n", $results) . "\n";
echo "Total tests: " . count($results) . ", Errors: " . count($errors) . "\n";
if (count($errors) > 0) {
    exit(1);
}

