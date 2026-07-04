import enum
from typing import Optional

from sqlalchemy import Boolean, CheckConstraint, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MaterialType(str, enum.Enum):
    NOTES = "Notes"
    SHORT_NOTES = "Short Notes"
    PPT = "PPT"
    TEXTBOOK = "Textbook"
    LAB_MANUAL = "Lab Manual"
    PRACTICAL_CODE = "Practical Code"


class UserRole(str, enum.Enum):
    SUPERADMIN = "superadmin"
    BRANCH_ADMIN = "branch_admin"


class ExamType(str, enum.Enum):
    END_SEM = "End Sem"
    TT1 = "TT1"
    TT2 = "TT2"


class Branch(Base):
    """A branch, or the shared First Year curriculum (e.g. code='FE')."""

    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "FE Common", "AI & DS"
    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)  # e.g. "FE", "AIDS"

    subjects: Mapped[list["Subject"]] = relationship(back_populates="branch", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False)
    has_theory: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    has_lab: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    branch: Mapped["Branch"] = relationship(back_populates="subjects")
    modules: Mapped[list["Module"]] = relationship(
        back_populates="subject", cascade="all, delete-orphan", order_by="Module.position"
    )
    experiments: Mapped[list["Experiment"]] = relationship(back_populates="subject", cascade="all, delete-orphan")
    pyqs: Mapped[list["PYQ"]] = relationship(
        back_populates="subject", cascade="all, delete-orphan", order_by="PYQ.year.desc()"
    )


class Module(Base):
    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"), nullable=False)

    subject: Mapped["Subject"] = relationship(back_populates="modules")
    materials: Mapped[list["Material"]] = relationship(back_populates="module", cascade="all, delete-orphan")


class Experiment(Base):
    __tablename__ = "experiments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    experiment_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"), nullable=False)

    subject: Mapped["Subject"] = relationship(back_populates="experiments")
    materials: Mapped[list["Material"]] = relationship(back_populates="experiment", cascade="all, delete-orphan")


class Material(Base):
    __tablename__ = "materials"
    __table_args__ = (
        CheckConstraint(
            "(module_id IS NOT NULL AND experiment_id IS NULL) "
            "OR (module_id IS NULL AND experiment_id IS NOT NULL)",
            name="ck_materials_module_xor_experiment",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[MaterialType] = mapped_column(
        Enum(MaterialType, name="material_type", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    module_id: Mapped[Optional[int]] = mapped_column(ForeignKey("modules.id"), nullable=True)
    experiment_id: Mapped[Optional[int]] = mapped_column(ForeignKey("experiments.id"), nullable=True)

    module: Mapped[Optional["Module"]] = relationship(back_populates="materials")
    experiment: Mapped[Optional["Experiment"]] = relationship(back_populates="materials")


class PYQ(Base):
    """A previous-year question paper, attached directly to a Subject (not a Module/Experiment)."""

    __tablename__ = "pyqs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"), nullable=False)
    exam_type: Mapped[ExamType] = mapped_column(
        Enum(ExamType, name="exam_type", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)

    subject: Mapped["Subject"] = relationship(back_populates="pyqs")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        default=UserRole.BRANCH_ADMIN,
    )
    branch_id: Mapped[Optional[int]] = mapped_column(ForeignKey("branches.id"), nullable=True)

    branch: Mapped[Optional["Branch"]] = relationship()
