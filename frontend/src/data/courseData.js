const courseStructure = {
  "school-tuition": {
    name: "School Tuition",
    description: "Best home tuition for school students in Bangalore",
    subcategories: {
      "class-6-8": {
        name: "Classes 6–8",
        courses: [
          {
            name: "Maths Tuition",
            slug: "maths",
            seoTitle: "Class 6-8 Maths Tuition in Bangalore",
            seoDesc:
              "Get best maths tuition for class 6 to 8 in Bangalore with expert tutors.",
          },
          {
            name: "Science Tuition",
            slug: "science",
            seoTitle: "Class 6-8 Science Tuition in Bangalore",
            seoDesc:
              "Expert science tutors for class 6 to 8 in Bangalore.",
          },
        ],
      },

      "class-9-10": {
        name: "Classes 9–10",
        courses: [
          {
            name: "Maths Tuition",
            slug: "maths",
            seoTitle: "Class 10 Maths Tuition in Bangalore",
            seoDesc: "Top maths tutors for class 10 in Bangalore.",
          },
        ],
      },
    },
  },

  "competitive-exams": {
    name: "Competitive Exams",
    description: "Prepare for JEE, NEET with expert tutors",
    subcategories: {
      jee: {
        name: "JEE Preparation",
        courses: [
          {
            name: "Physics for JEE",
            slug: "physics",
            seoTitle: "JEE Physics Coaching in Bangalore",
            seoDesc: "Best JEE physics coaching with expert faculty.",
          },
        ],
      },
    },
  },

  skills: {
    name: "Skill Courses",
    description: "Learn communication, coding, and more",
    subcategories: {
      communication: {
        name: "Communication Skills",
        courses: [
          {
            name: "Spoken English",
            slug: "spoken-english",
            seoTitle: "Spoken English Classes in Bangalore",
            seoDesc: "Improve communication with expert trainers.",
          },
        ],
      },
    },
  },
};

export default courseStructure;