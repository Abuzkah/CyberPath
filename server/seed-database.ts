import { db } from "./db";
import { users, modules, achievements, userProgress, userAchievements } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create default user
    const [defaultUser] = await db.insert(users).values({
      username: "user@cyberpath",
      email: "user@cyberpath.com",
      githubToken: null
    }).returning().onConflictDoNothing();

    console.log("Created default user:", defaultUser?.id);

    // Create modules
    const moduleData = [
      {
        title: "Reconnaissance",
        description: "Master the art of information gathering, OSINT techniques, and network scanning fundamentals.",
        icon: "fa-search",
        tools: ["Nmap", "Shodan", "theHarvester"],
        order: 1,
        prerequisiteModules: null
      },
      {
        title: "Web Application Hacking",
        description: "Learn to identify and exploit web vulnerabilities including SQL injection, XSS, and authentication bypasses.",
        icon: "fa-globe",
        tools: ["Burp Suite", "OWASP ZAP", "SQLmap"],
        order: 2,
        prerequisiteModules: [1]
      },
      {
        title: "Exploit Development",
        description: "Deep dive into buffer overflows, shellcode development, and advanced exploitation techniques.",
        icon: "fa-bug",
        tools: ["GDB", "Metasploit", "IDA Pro"],
        order: 3,
        prerequisiteModules: [1, 2]
      },
      {
        title: "Active Directory Attacks",
        description: "Master domain enumeration, privilege escalation, and lateral movement in AD environments.",
        icon: "fa-network-wired",
        tools: ["BloodHound", "Mimikatz", "PowerView"],
        order: 4,
        prerequisiteModules: [1, 2]
      },
      {
        title: "Bluetooth Hacking",
        description: "Learn Bluetooth protocol vulnerabilities, BLE attacks, and wireless exploitation techniques.",
        icon: "fa-bluetooth",
        tools: ["Bluez", "Ubertooth", "HackRF"],
        order: 5,
        prerequisiteModules: [1]
      },
      {
        title: "Capture The Flag",
        description: "Apply your skills in competitive CTF challenges and advanced problem-solving scenarios.",
        icon: "fa-flag",
        tools: ["pwntools", "Wireshark", "John"],
        order: 6,
        prerequisiteModules: [1, 2, 3]
      }
    ];

    const insertedModules = await db.insert(modules).values(moduleData).returning().onConflictDoNothing();
    console.log("Created modules:", insertedModules.length);

    // Create achievements
    const achievementData = [
      {
        title: "Recon Master",
        description: "Completed all reconnaissance modules",
        icon: "fa-search",
        condition: "complete_modules:1"
      },
      {
        title: "Script Kiddie",
        description: "Uploaded 10 custom scripts",
        icon: "fa-code",
        condition: "upload_scripts:10"
      },
      {
        title: "Defender",
        description: "Complete 5 defensive challenges",
        icon: "fa-shield-alt",
        condition: "complete_defensive:5"
      },
      {
        title: "Bug Hunter",
        description: "Find 25 vulnerabilities",
        icon: "fa-bug",
        condition: "find_vulns:25"
      },
      {
        title: "Streak",
        description: "30 day learning streak",
        icon: "fa-fire",
        condition: "learning_streak:30"
      },
      {
        title: "Elite",
        description: "Complete all modules",
        icon: "fa-crown",
        condition: "complete_all_modules"
      }
    ];

    const insertedAchievements = await db.insert(achievements).values(achievementData).returning().onConflictDoNothing();
    console.log("Created achievements:", insertedAchievements.length);

    // Create sample progress for the default user if they exist
    if (defaultUser && insertedModules.length > 0) {
      await db.insert(userProgress).values([
        {
          userId: defaultUser.id,
          moduleId: insertedModules[0].id,
          completed: true,
          progress: 100
        },
        {
          userId: defaultUser.id,
          moduleId: insertedModules[1].id,
          completed: false,
          progress: 75
        }
      ]).onConflictDoNothing();

      console.log("Created sample progress");

      // Unlock first achievement
      if (insertedAchievements.length > 0) {
        await db.insert(userAchievements).values({
          userId: defaultUser.id,
          achievementId: insertedAchievements[0].id
        }).onConflictDoNothing();

        console.log("Unlocked first achievement");
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}