import { DocumentItem } from "./types";

export const PRECOMPILED_DOCUMENTS: DocumentItem[] = [
  {
    id: "precompiled_psychology",
    title: "Introduction to Psychology: Cognitive Development",
    subject: "Psychology",
    content: "Cognitive development is a field of study in neuroscience and psychology focusing on a child's development in terms of information processing, conceptual resources, perceptual skill, language learning, and other aspects of the developed adult brain and cognitive psychology. Jean Piaget was a pioneer in this field, proposing his famous Theory of Cognitive Development. Piaget argued that children actively construct knowledge as they explore and manipulate the world. He introduced the concepts of schemas (mental frameworks), assimilation (fitting new information into existing schemas), and accommodation (modifying schemas to fit new experiences). Piaget identified four distinct developmental stages: 1. Sensorimotor Stage (Birth to 2 years): Coordination of sensory input and motor responses; development of object permanence. 2. Preoperational Stage (2 to 7 years): Development of symbolic thought, marked by egocentrism (inability to see things from others' perspectives) and lack of conservation. 3. Concrete Operational Stage (7 to 11 years): Mental operations applied to concrete events; mastery of conservation, hierarchical classification. 4. Formal Operational Stage (11 years and up): Mental operations applied to abstract ideas; logical, systematic thinking, and hypothetical-deductive reasoning. Lev Vygotsky offered an alternative socio-cultural perspective, emphasizing the role of social interaction, language, and culture. Vygotsky introduced the Zone of Proximal Development (ZPD), which describes the range of tasks that a child cannot yet perform alone but can accomplish with the guidance and encouragement of a more skilled partner (scaffolding).",
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    wordCount: 260,
    summary: {
      title: "Cognitive Development: Piaget's Stages & Vygotsky's ZPD",
      subject: "Psychology",
      summaryText: "This module covers the foundational models of cognitive development in children. It highlights Jean Piaget's structural stages of mental construction (focusing on schemas, assimilation, accommodation, and the four main stages from sensorimotor to formal operations) and contrasts it with Lev Vygotsky's socio-cultural perspective emphasizing interactive learning, scaffolding, and the Zone of Proximal Development (ZPD).",
      keyConcepts: [
        {
          title: "Schemas, Assimilation & Accommodation",
          explanation: "Schemas are cognitive frameworks. Assimilation integrates new experiences into existing schemas. Accommodation alters schemas when new facts conflict with current understandings."
        },
        {
          title: "Object Permanence",
          explanation: "The understanding that objects continue to exist even when they cannot be observed. This critical milestone is achieved during the Sensorimotor stage (birth to 2 years)."
        },
        {
          title: "Zone of Proximal Development (ZPD)",
          explanation: "Vygotsky's concept defining the gap between what a learner can do independently and what they can achieve with optimal guidance (scaffolding)."
        },
        {
          title: "Egocentrism",
          explanation: "A cognitive characteristic of the preoperational stage (2-7 years) where children struggle to distinguish their own perspective from that of others."
        }
      ],
      bulletPoints: [
        "Jean Piaget proposed that children construct mental models through active environmental exploration.",
        "The sensorimotor stage is marked by motor reactions and culminates in object permanence.",
        "Preoperational children use symbols but exhibit egocentrism and lack conservation reasoning.",
        "Concrete operations see logic applied to tangible items, while formal operations unlock abstract, deductive reasoning.",
        "Vygotsky's socio-cultural view frames cognitive growth as a social process mediated by language and guided peer tutoring."
      ],
      studyTips: [
        "Create a matrix contrasting Piaget (individual schema builder) and Vygotsky (cultural/social apprentice).",
        "Associate Object Permanence with a peek-a-boo game to remember it belongs to the Sensorimotor phase.",
        "Remember ZPD as the sweet spot for learning: tasks that are challenging but achievable with assistance."
      ]
    },
    quiz: [
      {
        question: "According to Piaget, during which stage does a child develop abstract thinking and systematic, hypothetical-deductive reasoning?",
        options: [
          "Sensorimotor Stage",
          "Preoperational Stage",
          "Concrete Operational Stage",
          "Formal Operational Stage"
        ],
        correctOptionIndex: 3,
        explanation: "The Formal Operational Stage (beginning around age 11-12) is characterized by the onset of abstract thinking, systematic logic, and the ability to formulate and test hypotheses."
      },
      {
        question: "A child sees a coin being hidden under a cup and understands it is still there even when out of view. What milestone has this child reached, and in which stage?",
        options: [
          "Conservation in the Preoperational stage",
          "Object Permanence in the Sensorimotor stage",
          "Hierarchical classification in Concrete Operations",
          "Egocentrism in Concrete Operations"
        ],
        correctOptionIndex: 1,
        explanation: "Object permanence is the realization that things continue to exist even when hidden, and it is a defining cognitive breakthrough of the Sensorimotor stage (birth to 2 years)."
      },
      {
        question: "Which term describes Lev Vygotsky's concept of temporary guidance provided to a student to help them master a concept within their Zone of Proximal Development?",
        options: [
          "Assimilation",
          "Accommodation",
          "Scaffolding",
          "Conservation"
        ],
        correctOptionIndex: 2,
        explanation: "Scaffolding is the process where a teacher or advanced peer provides structured support to help a student successfully complete a task they couldn't perform alone yet."
      }
    ],
    flashcards: [
      {
        front: "What is Assimilation in developmental psychology?",
        back: "Fitting new external information or experiences into pre-existing cognitive structures (schemas) without changing the structures themselves.",
        concept: "Piaget's Adaptation Processes"
      },
      {
        front: "What is the age range and primary characteristic of the Concrete Operational Stage?",
        back: "Ages 7 to 11. Marked by logical thinking applied to concrete events, mastery of conservation, and understanding classification.",
        concept: "Piaget's Stages"
      },
      {
        front: "Define Egocentrism as described by Jean Piaget.",
        back: "The child's inability to see any point of view other than their own, prominent in the preoperational stage (ages 2 to 7).",
        concept: "Preoperational Limits"
      },
      {
        front: "What is the Zone of Proximal Development (ZPD)?",
        back: "The distance between what a child can achieve independently and what they can achieve under adult guidance or with peer collaboration.",
        concept: "Vygotsky's Socio-cultural theory"
      }
    ]
  },
  {
    id: "precompiled_physics",
    title: "Physics 101: Newton's Laws and Classical Mechanics",
    subject: "Physics",
    content: "Classical mechanics is a model of the physics of forces acting upon bodies. It is often referred to as Newtonian mechanics after Isaac Newton and his laws of motion. Newton published these three laws in his Philosophiæ Naturalis Principia Mathematica in 1687. First Law (Law of Inertia): An object at rest remains at rest, and an object in motion remains in motion at a constant velocity in a straight line unless acted upon by a net external force. This property is known as inertia. Second Law (Law of Acceleration): The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. It is represented by the formula F = ma (Force equals mass times acceleration). Third Law (Law of Action-Reaction): For every action, there is an equal and opposite reaction. This means that forces always occur in matched pairs; when object A exerts a force on object B, B simultaneously exerts an equal and opposite force on A. These laws form the foundation for analyzing statics, dynamics, and planetary orbits.",
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    wordCount: 195,
    summary: {
      title: "Classical Mechanics: Isaac Newton's Three Laws of Motion",
      subject: "Physics",
      summaryText: "This study module provides a concise breakdown of classical mechanics based on Isaac Newton's three laws of motion published in 1687. It explores inertia, quantitative force-mass-acceleration relationships (F = ma), and the reciprocal nature of interactive forces.",
      keyConcepts: [
        {
          title: "Inertia",
          explanation: "The fundamental tendency of physical matter to resist changes in its state of motion. Mass is the direct quantitative measure of an object's inertia."
        },
        {
          title: "Force (F = ma)",
          explanation: "Force is a vector quantity that causes an object with mass to accelerate. Acceleration is always in the same direction as the net force."
        },
        {
          title: "Action & Reaction Pairs",
          explanation: "Interactive forces that are equal in magnitude, opposite in direction, act on different bodies, and occur simultaneously."
        }
      ],
      bulletPoints: [
        "Inertia explains why passengers slide forward when a vehicle brakes suddenly.",
        "The Second Law defines a linear relationship: doubling the net force doubles acceleration, while doubling mass halves it.",
        "Forces never exist in isolation; they are always the result of a two-body interaction.",
        "Newton's laws assume flat Euclidian space and ignore relativistic or quantum-level behaviors."
      ],
      studyTips: [
        "Keep in mind that action-reaction force pairs act on DIFFERENT objects, which is why they do not cancel each other out.",
        "Visualize F = ma by imagining pushing an empty shopping cart (low mass, high acceleration) versus a fully loaded one (high mass, low acceleration) with the same force."
      ]
    },
    quiz: [
      {
        question: "Which equation represents Newton's Second Law of Motion?",
        options: [
          "E = mc²",
          "F = ma",
          "p = mv",
          "v = d/t"
        ],
        correctOptionIndex: 1,
        explanation: "Newton's Second Law quantifies the relationship between force, mass, and acceleration, represented by F = ma (Force = mass × acceleration)."
      },
      {
        question: "Why don't action and reaction forces cancel each other out to keep net movement at zero?",
        options: [
          "They act on different objects.",
          "They are not actually equal.",
          "They happen at different times.",
          "They only occur in outer space."
        ],
        correctOptionIndex: 0,
        explanation: "Action-reaction forces act on two different interacting bodies, so they cannot cancel each other out on a single body."
      }
    ],
    flashcards: [
      {
        front: "What is Newton's First Law of Motion also known as?",
        back: "The Law of Inertia.",
        concept: "Inertia"
      },
      {
        front: "If you double the net force acting on an object, what happens to its acceleration?",
        back: "The acceleration is doubled, as acceleration is directly proportional to the net force (F = ma).",
        concept: "Second Law Dynamics"
      },
      {
        front: "Explain Newton's Third Law in simple interactive terms.",
        back: "For every action, there is an equal and opposite reaction. Forces always occur in simultaneous pairs acting on two different bodies.",
        concept: "Action-Reaction"
      }
    ]
  }
];
