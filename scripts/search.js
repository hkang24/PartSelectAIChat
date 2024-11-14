async function checkUrl(url) {
    try {
        const response = await fetch("https://www.partselect.com/api/search/?searchterm=Fridge");
        const data = await response.text();
        
        // Extract canonical URL using regex
        const canonicalMatch = data.match(/<link rel="canonical" href="([^"]+)"/);
        const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;

        const responseTwo = await fetch(canonicalUrl);
        const dataTwo = await responseTwo.text();
        
        return {
            status: response.status,
            statusText: response.statusText,
            canonicalUrl: canonicalUrl,
            dataTwo: dataTwo
        };
    } catch (error) {
        console.error('Error fetching URL:', error);
        return {
            status: 'error',
            statusText: error.message,
            canonicalUrl: null,
            dataTwo: null
        };
    }
}

// Run the function
checkUrl()
    .then(result => console.log('Result:', result.dataTwo, result.canonicalUrl))
    .catch(error => console.error('Error:', error));