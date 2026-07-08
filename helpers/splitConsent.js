exports.splitConsent = (consent, language) => {

    let englishConsent = consent;
    let regionalConsent = "";

    if (language !== "English") {

        const parts = consent.split(
            "========================"
        );

        if (parts.length >= 5) {

            englishConsent = parts[2].trim();
            regionalConsent = parts[4].trim();

        }

    }

    return {
        englishConsent,
        regionalConsent
    };

};