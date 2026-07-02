from fastapi import APIRouter

from app.api.v1.endpoints import (
	admin,
	auth,
	ai,
	candidates,
	imports,
	interviews,
	outreach_logs,
	requisitions,
	scorecards,
	talent_pools,
	users,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(imports.router, prefix="/admin/import", tags=["admin"])
api_router.include_router(requisitions.router, prefix="/requisitions", tags=["requisitions"])
api_router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(talent_pools.router, prefix="/talent-pools", tags=["talent-pools"])
api_router.include_router(scorecards.router, prefix="/scorecards", tags=["scorecards"])
api_router.include_router(outreach_logs.router, prefix="/outreach-logs", tags=["outreach-logs"])
