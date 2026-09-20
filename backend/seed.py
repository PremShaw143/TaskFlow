from app.database import SessionLocal
from app.auth import hash_password
from app.models.user import User
from app.models.project import Project
from app.models.membership import ProjectMembership
from app.models.task import Task


db = SessionLocal()


try:
    # -----------------------------
    # Create users
    # -----------------------------

    user1 = (
        db.query(User)
        .filter(User.email == "seed.owner@taskflow.com")
        .first()
    )

    if user1 is None:
        user1 = User(
            name="Seed Owner",
            email="seed.owner@taskflow.com",
            password_hash=hash_password("SeedOwner@123")
        )
        db.add(user1)
        db.commit()
        db.refresh(user1)

    user2 = (
        db.query(User)
        .filter(User.email == "seed.member@taskflow.com")
        .first()
    )

    if user2 is None:
        user2 = User(
            name="Seed Member",
            email="seed.member@taskflow.com",
            password_hash=hash_password("SeedMember@123")
        )
        db.add(user2)
        db.commit()
        db.refresh(user2)


    # -----------------------------
    # Create shared project
    # -----------------------------

    project = (
        db.query(Project)
        .filter(Project.name == "TaskFlow Seed Project")
        .first()
    )

    if project is None:
        project = Project(
    name="TaskFlow Seed Project",
    description="Shared project created by seed script",
    owner_id=user1.id,
    priority="High"
)

        db.add(project)
        db.commit()
        db.refresh(project)


    # -----------------------------
    # Create memberships
    # -----------------------------

    owner_membership = (
        db.query(ProjectMembership)
        .filter(
            ProjectMembership.project_id == project.id,
            ProjectMembership.user_id == user1.id
        )
        .first()
    )

    if owner_membership is None:
        owner_membership = ProjectMembership(
            project_id=project.id,
            user_id=user1.id,
            role="owner"
        )
        db.add(owner_membership)


    member_membership = (
        db.query(ProjectMembership)
        .filter(
            ProjectMembership.project_id == project.id,
            ProjectMembership.user_id == user2.id
        )
        .first()
    )

    if member_membership is None:
        member_membership = ProjectMembership(
            project_id=project.id,
            user_id=user2.id,
            role="member"
        )
        db.add(member_membership)

    db.commit()


    # -----------------------------
    # Create tasks
    # -----------------------------

    task1 = (
        db.query(Task)
        .filter(
            Task.project_id == project.id,
            Task.title == "Seed Task Assigned To Member"
        )
        .first()
    )

    if task1 is None:
        task1 = Task(
            project_id=project.id,
            created_by=user1.id,
            assignee_id=user2.id,
            title="Seed Task Assigned To Member",
            description="This task is assigned to the seed member.",
            status="To Do",
            priority="High"
        )
        db.add(task1)


    task2 = (
        db.query(Task)
        .filter(
            Task.project_id == project.id,
            Task.title == "Seed Task Assigned To Owner"
        )
        .first()
    )

    if task2 is None:
        task2 = Task(
            project_id=project.id,
            created_by=user2.id,
            assignee_id=user1.id,
            title="Seed Task Assigned To Owner",
            description="This task is assigned to the project owner.",
            status="In Progress",
            priority="Medium"
        )
        db.add(task2)


    task3 = (
        db.query(Task)
        .filter(
            Task.project_id == project.id,
            Task.title == "Seed Unassigned Task"
        )
        .first()
    )

    if task3 is None:
        task3 = Task(
            project_id=project.id,
            created_by=user1.id,
            assignee_id=None,
            title="Seed Unassigned Task",
            description="This task currently has no assignee.",
            status="To Do",
            priority="Low"
        )
        db.add(task3)


    db.commit()


    print("--------------------------------")
    print("Seed completed successfully")
    print("--------------------------------")
    print("Owner:")
    print("  Email: seed.owner@taskflow.com")
    print("  Password: SeedOwner@123")
    print()
    print("Member:")
    print("  Email: seed.member@taskflow.com")
    print("  Password: SeedMember@123")
    print()
    print("Project:")
    print("  Name:", project.name)
    print("  ID:", project.id)
    print("--------------------------------")


finally:
    db.close()