export async function GET() {
    const courses = [
      { id: 1, title: "React Mastery", category: "Career Skills" },
      { id: 2, title: "Next.js for Beginners", category: "Free Courses" },
      { id: 3, title: "Product Management 101", category: "Product Management" },
      { id: 4, title: "Advanced JavaScript", category: "Career Skills" },
      { id: 5, title: "UI/UX Design Basics", category: "Career Skills" },
      { id: 6, title: "Python for Data Science", category: "Free Courses" },
      { id: 7, title: "Full-Stack Web Dev", category: "Career Skills" },
      { id: 8, title: "Mobile App Development", category: "Product Management" },
      { id: 9, title: "Machine Learning", category: "Free Courses" },
      { id: 10, title: "Data Science Bootcamp", category: "Career Skills" },
      { id: 11, title: "AI with Python", category: "Product Management" },
    ];
  
    return Response.json(courses);
  }
  