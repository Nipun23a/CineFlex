const Footer = () => {
    return (
        <footer className="border-t border-gray-800 py-12" style={{backgroundColor: '#1E1E2F'}}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="text-3xl font-bold mb-4">
                        <span className="text-white">Cine</span>
                        <span style={{color: '#EF233C'}}>Flex</span>
                    </div>
                    <p className="text-gray-400 mb-6">Your gateway to cinematic adventures</p>
                    <div className="flex justify-center space-x-8">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                    </div>
                    <p className="text-gray-500 text-sm mt-6">© 2025 CineFlex. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
export default Footer;