exports.categorizeClaim = (claim) => {
    const nutritionKeywords = ['diet', 'nutrition', 'vitamin', 'fruit', 'healthy', 'oranges'];
    const medicineKeywords = ['medicine', 'treatment', 'prescription', 'doctor'];
    const mentalHealthKeywords = ['mental health', 'therapy', 'stress', 'anxiety'];

    if (nutritionKeywords.some(keyword => claim.toLowerCase().includes(keyword))) {
        return "Nutrition";
    } else if (medicineKeywords.some(keyword => claim.toLowerCase().includes(keyword))) {
        return "Medicine";
    } else if (mentalHealthKeywords.some(keyword => claim.toLowerCase().includes(keyword))) {
        return "Mental Health";
    }
    return "Uncategorized";
};