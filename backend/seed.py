import asyncio

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models import Branch, Experiment, Material, MaterialType, Module, Subject

BRANCHES = [
    ("FE Common", "FE"),
    ("Electronics and Telecommunication Engg", "EXTC"),
    ("Information Technology", "IT"),
    ("Computer Engineering", "CE"),
    ("Mechanical Engineering", "MECH"),
    ("Computer Science and Engineering (Data Science)", "CSE-DS"),
    ("Artificial Intelligence and Machine Learning", "AIML"),
    ("Artificial Intelligence (AI) and Data Science", "AIDS"),
    ("Computer Science and Engineering (IOT and Cyber Security with Block Chain Technology)", "CSE-ICB"),
]


async def get_or_create_branch(session, name: str, code: str) -> Branch:
    branch = (await session.execute(select(Branch).where(Branch.code == code))).scalar_one_or_none()
    if branch is None:
        branch = Branch(name=name, code=code)
        session.add(branch)
        await session.flush()
    elif branch.name != name:
        branch.name = name
    return branch


async def get_or_create_subject(
    session, name: str, semester: int, branch_id: int, has_theory: bool = True, has_lab: bool = False
) -> Subject:
    subject = (
        await session.execute(select(Subject).where(Subject.name == name, Subject.branch_id == branch_id))
    ).scalar_one_or_none()
    if subject is None:
        subject = Subject(
            name=name, semester=semester, branch_id=branch_id, has_theory=has_theory, has_lab=has_lab
        )
        session.add(subject)
        await session.flush()
    else:
        subject.has_theory = has_theory
        subject.has_lab = has_lab
    return subject


async def get_or_create_module(session, title: str, position: int, subject_id: int) -> Module:
    module = (
        await session.execute(select(Module).where(Module.title == title, Module.subject_id == subject_id))
    ).scalar_one_or_none()
    if module is None:
        module = Module(title=title, position=position, subject_id=subject_id)
        session.add(module)
        await session.flush()
    return module


async def get_or_create_experiment(session, experiment_number: int, title: str, subject_id: int) -> Experiment:
    experiment = (
        await session.execute(
            select(Experiment).where(Experiment.title == title, Experiment.subject_id == subject_id)
        )
    ).scalar_one_or_none()
    if experiment is None:
        experiment = Experiment(experiment_number=experiment_number, title=title, subject_id=subject_id)
        session.add(experiment)
        await session.flush()
    return experiment


async def get_or_create_material(
    session, title: str, type_: MaterialType, file_url: str, *, module_id: int = None, experiment_id: int = None
) -> Material:
    stmt = select(Material).where(Material.title == title)
    stmt = stmt.where(Material.module_id == module_id) if module_id is not None else stmt.where(
        Material.experiment_id == experiment_id
    )
    material = (await session.execute(stmt)).scalar_one_or_none()
    if material is None:
        material = Material(
            title=title, type=type_, file_url=file_url, module_id=module_id, experiment_id=experiment_id
        )
        session.add(material)
    return material


async def seed():
    async with AsyncSessionLocal() as session:
        branches = {}
        for name, code in BRANCHES:
            branches[code] = await get_or_create_branch(session, name, code)

        physics = await get_or_create_subject(session, "Engineering Physics", 1, branches["FE"].id)
        dbms = await get_or_create_subject(session, "Database Management Systems", 3, branches["AIDS"].id)

        module1 = await get_or_create_module(session, "Relational Algebra", 1, dbms.id)

        data_structures = await get_or_create_subject(
            session, "Data Structures", 3, branches["AIDS"].id, has_theory=True, has_lab=True
        )

        ds_module1 = await get_or_create_module(session, "Stacks and Queues", 1, data_structures.id)
        await get_or_create_material(
            session,
            "Stack & Queue Cheat Sheet",
            MaterialType.SHORT_NOTES,
            "https://example.com/ds-notes.pdf",
            module_id=ds_module1.id,
        )

        ds_experiment1 = await get_or_create_experiment(
            session, 1, "Implementation of Stacks using Arrays", data_structures.id
        )
        await get_or_create_material(
            session,
            "Exp 1 Lab Manual",
            MaterialType.LAB_MANUAL,
            "https://example.com/ds-exp1-manual.pdf",
            experiment_id=ds_experiment1.id,
        )
        await get_or_create_material(
            session,
            "Stack C++ Code",
            MaterialType.PRACTICAL_CODE,
            "https://example.com/ds-exp1-code.cpp",
            experiment_id=ds_experiment1.id,
        )

        await session.commit()
        print(f"Seed complete. {len(BRANCHES)} branches ensured.")


if __name__ == "__main__":
    asyncio.run(seed())
