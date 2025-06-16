import person1 from '../assets/images/team/meni.jpg'
import person2 from '../assets/images/team/albert.jpg'

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  experience: string;
  specialties: string[];
  image: string;
  quote: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Gazmend Tola",
    position: "Founder & Master Craftsman",
    bio: "With over 15 years of experience in the tile industry, Michael founded Tola Tiles with a vision to bring exceptional craftsmanship to every project. His attention to detail and commitment to quality has made Tola Tiles the premier choice for tile installation.",
    experience: "15+ years",
    specialties: ["Natural Stone Installation", "Custom Design", "Large Format Tiles", "Historical Restoration"],
    image: person1,
    quote: "Every tile tells a story, and we're here to help you write yours with precision and artistry."
  },
  {
    id: 2,
    name: "Albert",
    position: "Lead Design Consultant",
    bio: "Albert brings creativity and technical expertise to every design consultation. With a background in interior design and deep knowledge of tile trends, she helps clients choose the perfect materials and layouts for their vision.",
    experience: "8+ years",
    specialties: ["Design Consultation", "Color Coordination", "Pattern Layout", "Material Selection"],
    image: person2,
    quote: "Great design is about creating spaces that reflect who you are while standing the test of time."
  },
  
];