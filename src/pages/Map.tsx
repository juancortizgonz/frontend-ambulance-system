import BaseLayout from "@/layouts/BaseLayout"
import MapContainer from "@/components/map/MapContainer"

const Map = () => {

    return (
        <BaseLayout>
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold mb-4">Visión de mapa</h1>
                <MapContainer />
            </div>
        </BaseLayout>
    )
}

export default Map