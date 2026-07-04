from typing import Optional

from pydantic import BaseModel, ConfigDict, model_validator

from app.models import ExamType, MaterialType


class BranchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str


class SubjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    semester: int
    branch_id: int
    has_theory: bool
    has_lab: bool


class MaterialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    type: MaterialType
    file_url: str
    module_id: Optional[int]
    experiment_id: Optional[int]


class ModuleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    position: int
    subject_id: int
    materials: list[MaterialOut] = []


class ExperimentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    experiment_number: int
    title: str
    subject_id: int
    materials: list[MaterialOut] = []


class PYQOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    subject_id: int
    exam_type: ExamType
    year: int
    file_url: str


class SubjectDetailOut(SubjectOut):
    modules: list[ModuleOut] = []
    experiments: list[ExperimentOut] = []
    pyqs: list[PYQOut] = []


class SubjectCreate(BaseModel):
    branch_id: int
    semester: int
    name: str
    has_theory: bool
    has_lab: bool


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    semester: Optional[int] = None
    has_theory: Optional[bool] = None
    has_lab: Optional[bool] = None


class ModuleCreate(BaseModel):
    subject_id: int
    title: str


class ModuleUpdate(BaseModel):
    title: str


class ModuleReorder(BaseModel):
    module_ids: list[int]


class ExperimentCreate(BaseModel):
    subject_id: int
    experiment_number: int
    title: str


class MaterialCreate(BaseModel):
    title: str
    type: MaterialType
    file_url: str
    module_id: Optional[int] = None
    experiment_id: Optional[int] = None

    @model_validator(mode="after")
    def check_module_xor_experiment(self):
        if (self.module_id is None) == (self.experiment_id is None):
            raise ValueError("Material must have exactly one of module_id or experiment_id")
        return self


class MaterialUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[MaterialType] = None
    file_url: Optional[str] = None


class PYQCreate(BaseModel):
    subject_id: int
    exam_type: ExamType
    year: int
    file_url: str


class PYQUpdate(BaseModel):
    exam_type: Optional[ExamType] = None
    year: Optional[int] = None
    file_url: Optional[str] = None


class UserCreate(BaseModel):
    username: str
    password: str
    branch_id: int


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    role: str
    branch_id: Optional[int] = None
